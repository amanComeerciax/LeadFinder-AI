import { Worker } from 'bullmq';
import { connection, enrichmentQueue } from '../config/queue.js';
import { extractContacts } from '../services/websiteScraper.service.js';
import { getPlaceDetails } from '../services/googleMaps.service.js';
import Business from '../models/Business.model.js';
import Job from '../models/Job.model.js';

// Get io instance from searchWorker or server
let io = null;
export const setEnrichmentSocketIO = (socketIO) => {
    io = socketIO;
};

// Queue is now imported from ../config/queue.js

const enrichmentWorker = new Worker(
    'enrichment-task',
    async (job) => {
        const { businessIds, userId, jobId } = job.data;
        const total = businessIds.length;
        let completed = 0;

        try {
            await Job.findOneAndUpdate({ jobId }, { status: 'processing', progress: 0 });

            console.log(`[Enrichment Worker] [Job:${jobId}] Starting enrichment for ${total} businesses`);

            // Emit started event
            if (io) {
                io.emit('enrichment:started', {
                    jobId,
                    userId,
                    total,
                    timestamp: new Date()
                });
            }

            // Process in chunks of 3 to handle Puppeteer load
            const chunkSize = 3;
            for (let i = 0; i < total; i += chunkSize) {
                // Check if job was cancelled or paused
                const currentJob = await Job.findOne({ jobId });
                if (currentJob) {
                    if (currentJob.status === 'cancelled') {
                        console.log(`[Enrichment Worker] [Job:${jobId}] Job was cancelled. Stopping.`);

                        // Emit cancellation event with partial data
                        if (io) {
                            const partialData = await Business.find({ jobIds: jobId }).sort({ createdAt: -1 });
                            io.emit('enrichment:cancelled', {
                                jobId,
                                userId,
                                completed,
                                total,
                                data: partialData,
                                message: 'Enrichment job cancelled'
                            });
                        }

                        return { success: false, status: 'cancelled' };
                    }
                    if (currentJob.status === 'paused') {
                        console.log(`[Enrichment Worker] [Job:${jobId}] Job was paused. Stopping.`);

                        // Emit paused event
                        if (io) {
                            io.emit('enrichment:paused', {
                                jobId,
                                userId,
                                completed,
                                total,
                                message: 'Enrichment job paused'
                            });
                        }

                        return { success: true, status: 'paused', count: completed };
                    }
                }

                const chunkIds = businessIds.slice(i, i + chunkSize);

                const results = await Promise.all(
                    chunkIds.map(async (id) => {
                        try {
                            // Frequent cancellation check
                            const checkCancellation = async () => {
                                const currentJob = await Job.findOne({ jobId });
                                return currentJob && currentJob.status === 'cancelled';
                            };

                            if (await checkCancellation()) return null;

                            // Priority: Look up by place_id first (passed from searchWorker)
                            // Falling back to findById if not found
                            let business = await Business.findOne({ place_id: id });

                            if (!business && id && id.length === 24) {
                                business = await Business.findById(id);
                            }

                            if (!business) return null;

                            // If website/phone missing, fetch from Place Details
                            if (!business.website || business.website === 'N/A' || !business.phone || business.phone === 'N/A') {
                                console.log(`[Enrichment Worker] [Job:${jobId}] Fetching missing details for: ${business.name}`);
                                const details = await getPlaceDetails(business.place_id);

                                business.website = details.website || business.website || 'N/A';
                                business.phone = details.phone || business.phone || 'N/A';

                                // Update DB with basic details before scraping
                                await Business.findByIdAndUpdate(business._id, {
                                    website: business.website,
                                    phone: business.phone
                                });
                            }

                            if (!business.website || business.website === 'N/A') {
                                console.log(`[Enrichment Worker] [Job:${jobId}] Skipping ${business.name} - No website found`);
                                return null;
                            }

                            // Skip if already enriched (has email or social links) unless forced (todo)
                            const hasSocial = business.socialLinks && Object.values(business.socialLinks).some(link => link && link !== 'N/A');
                            if (business.email && business.email !== 'N/A' && hasSocial) {
                                console.log(`[Enrichment Worker] [Job:${jobId}] Skipping ${business.name} - Already enriched`);
                                return business;
                            }

                            console.log(`[Enrichment Worker] [Job:${jobId}] Scraping: ${business.name} (${business.website})`);
                            const contacts = await extractContacts(business.website, checkCancellation, jobId);

                            // Update business with new data
                            const updatedData = {
                                deepScanStatus: 'complete',
                                deepScanDate: new Date(),
                                email: contacts.email || business.email,
                                facebookUrl: contacts.socialLinks?.facebook || business.facebookUrl,
                                twitterUrl: contacts.socialLinks?.twitter || business.twitterUrl,
                                linkedinUrl: contacts.socialLinks?.linkedin || business.linkedinUrl,
                                instagramUrl: contacts.socialLinks?.instagram || business.instagramUrl,
                                youtubeUrl: contacts.socialLinks?.youtube || business.youtubeUrl,
                                socialLinks: {
                                    facebook: contacts.socialLinks?.facebook || business.socialLinks?.facebook,
                                    twitter: contacts.socialLinks?.twitter || business.socialLinks?.twitter,
                                    linkedin: contacts.socialLinks?.linkedin || business.socialLinks?.linkedin,
                                    instagram: contacts.socialLinks?.instagram || business.socialLinks?.instagram,
                                    youtube: contacts.socialLinks?.youtube || business.socialLinks?.youtube,
                                }
                            };

                            const updatedBusiness = await Business.findByIdAndUpdate(
                                business._id,
                                {
                                    $set: updatedData,
                                    $addToSet: { jobIds: jobId }
                                },
                                { new: true }
                            );
                            return updatedBusiness;
                        } catch (err) {
                            console.error(`[Enrichment Worker] Error scraping ${id}:`, err.message);
                            return null;
                        }
                    })
                );

                completed += chunkIds.length;
                const progress = Math.round((completed / total) * 100);

                await job.updateProgress(progress);
                await Job.findOneAndUpdate({ jobId }, { progress });

                // Emit progress to frontend
                if (io) {
                    const successfullyEnriched = results.filter(r => r !== null);
                    io.emit('enrichment:progress', {
                        jobId,
                        userId, // Added for user-specific filtering
                        progress,
                        current: completed,
                        total,
                        data: successfullyEnriched // Send batch of updated businesses
                    });
                }
            }

            const finalUpdate = await Job.findOneAndUpdate(
                { jobId, status: { $nin: ['cancelled', 'paused'] } },
                { status: 'completed', progress: 100, completedAt: new Date() },
                { new: true }
            );

            if (!finalUpdate) {
                console.log(`[Enrichment Worker] Job ${jobId} was cancelled. Skipping final completion.`);
                return { success: false, status: 'cancelled' };
            }

            // Fetch all businesses that were enriched to send complete data to frontend
            console.log(`[Enrichment Worker] [Job:${jobId}] Fetching enriched businesses from DB (${businessIds.length} IDs)...`);
            const enrichedBusinesses = await Business.find({
                place_id: { $in: businessIds }
            }).sort({ createdAt: -1 });
            console.log(`[Enrichment Worker] [Job:${jobId}] Fetched ${enrichedBusinesses.length} businesses from DB`);

            if (io) {
                console.log(`[Enrichment Worker] [Job:${jobId}] Emitting enrichment:completed with ${enrichedBusinesses.length} businesses to frontend`);
                io.emit('enrichment:completed', {
                    jobId,
                    userId, // CRITICAL for frontend filtering
                    total,
                    data: enrichedBusinesses // Send complete enriched data
                });
            } else {
                console.warn(`[Enrichment Worker] [Job:${jobId}] Socket.io NOT available - cannot emit completion event!`);
            }

            return { success: true, count: completed };

        } catch (error) {
            console.error('[Enrichment Worker] Global error:', error.message);
            await Job.findOneAndUpdate({ jobId }, { status: 'failed', error: error.message });
            if (io) {
                io.emit('enrichment:failed', {
                    jobId,
                    userId, // CRITICAL for frontend filtering
                    error: error.message
                });
            }
            throw error;
        }
    },
    {
        connection,
        concurrency: 2, // Low concurrency for Puppeteer
        lockDuration: 600000,
    }
);

export default enrichmentWorker;
