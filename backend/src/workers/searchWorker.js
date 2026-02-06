import { Worker } from 'bullmq';
import { connection } from '../config/queue.js';
import { searchBusinesses } from '../services/googleMaps.service.js';
import { extractContacts } from '../services/websiteScraper.service.js';
import Business from '../models/Business.model.js';
import SearchHistory from '../models/SearchHistory.model.js';
import Job from '../models/Job.model.js';

// Import io - will be set after server initialization
let io = null;
export const setSocketIO = (socketIO) => {
    io = socketIO;
};

const searchWorker = new Worker(
    'business-search',
    async (job) => {
        const { keyword, location, userId, jobId } = job.data;

        try {
            await Job.findOneAndUpdate(
                { jobId },
                { status: 'processing', progress: 10 }
            );

            await job.updateProgress(10);

            // Emit job started event
            if (io) {
                io.emit('job:started', {
                    jobId,
                    keyword,
                    location,
                    timestamp: new Date()
                });
            }

            // Step 1: Scrape Google Maps
            const rawBusinesses = await searchBusinesses(keyword, location);

            // Deduplicate by place_id immediately
            const businesses = Array.from(
                new Map(rawBusinesses.map(b => [b.place_id, b])).values()
            ).filter(b => b.place_id);

            console.log(`Total unique businesses fetched: ${businesses.length}`);

            await job.updateProgress(40);
            await Job.findOneAndUpdate({ jobId }, { progress: 40 });

            // Emit progress event
            if (io) {
                io.emit('job:progress', {
                    jobId,
                    progress: 40,
                    current: businesses.length,
                    total: businesses.length,
                    message: 'Starting enrichment...'
                });
            }

            // Step 2: Deep Scan Websites for Emails & Social Links
            // Using Puppeteer-based deep scanning on first search for better results
            const chunkSize = 3; // Reduced from 5 to handle Puppeteer load better
            const enrichedBusinesses = [];

            console.log(`🔍 Starting DEEP SCAN for ${businesses.length} businesses (including subpages)...`);

            for (let i = 0; i < businesses.length; i += chunkSize) {
                const currentJob = await Job.findOne({ jobId });
                if (currentJob && currentJob.status === 'cancelled') {
                    console.log(`🛑 [Worker] Job ${jobId} cancelled. Stopping enrichment.`);
                    return { success: false, status: 'cancelled' };
                }

                const chunk = businesses.slice(i, i + chunkSize);
                const currentProgress = 40 + Math.floor((i / businesses.length) * 50); // Extended to 50% for deep scan

                await job.updateProgress(currentProgress);
                await Job.findOneAndUpdate({ jobId }, { progress: currentProgress });

                // Emit progress event with deep scan info
                if (io) {
                    io.emit('job:progress', {
                        jobId,
                        progress: currentProgress,
                        current: Math.min(i + chunkSize, businesses.length),
                        total: businesses.length,
                        message: `🔍 Deep scanning ${i + 1}-${Math.min(i + chunkSize, businesses.length)} (checking subpages for emails)...`
                    });
                }

                const chunkResults = await Promise.all(
                    chunk.map(async (business) => {
                        if (business.website && business.website !== 'N/A') {
                            try {
                                // Frequent cancellation check
                                const checkCancellation = async () => {
                                    const currentJob = await Job.findOne({ jobId });
                                    return currentJob && currentJob.status === 'cancelled';
                                };

                                console.log(`[Worker] 🔍 Deep Scanning: ${business.name} (${business.website})`);
                                const contacts = await extractContacts(business.website, checkCancellation, jobId);

                                return {
                                    ...business,
                                    email: contacts.email || business.email || null,
                                    socialLinks: {
                                        facebook: contacts.socialLinks?.facebook || null,
                                        twitter: contacts.socialLinks?.twitter || null,
                                        linkedin: contacts.socialLinks?.linkedin || null,
                                        instagram: contacts.socialLinks?.instagram || null,
                                        youtube: contacts.socialLinks?.youtube || null,
                                    },
                                    facebookUrl: contacts.socialLinks?.facebook || null,
                                    twitterUrl: contacts.socialLinks?.twitter || null,
                                    linkedinUrl: contacts.socialLinks?.linkedin || null,
                                    instagramUrl: contacts.socialLinks?.instagram || null,
                                    youtubeUrl: contacts.socialLinks?.youtube || null,
                                };
                            } catch (e) {
                                console.error(`[Worker] Failed to deep scan ${business.name}:`, e.message);
                                return business;
                            }
                        }
                        return business;
                    })
                );
                enrichedBusinesses.push(...chunkResults);
            }

            await job.updateProgress(90);
            await Job.findOneAndUpdate({ jobId }, { progress: 90 });

            // Emit progress event
            if (io) {
                io.emit('job:progress', {
                    jobId,
                    progress: 70,
                    message: 'Saving to database...'
                });
            }

            // Step 3: Save to Database
            // Use bulkWrite with upsert: true to update existing or insert new ones
            // This handles duplicate key errors gracefully without needing a Bloom filter
            let savedCount = 0;
            if (enrichedBusinesses.length > 0) {
                try {
                    // Deduplicate businesses by place_id within the local array to prevent race conditions during bulk upsert
                    const uniqueBusinesses = Array.from(
                        new Map(enrichedBusinesses.map(b => [b.place_id, b])).values()
                    ).filter(b => b.place_id);

                    const bulkOps = uniqueBusinesses.map(business => ({
                        updateOne: {
                            filter: { place_id: business.place_id },
                            update: { $set: business },
                            upsert: true
                        }
                    }));

                    await Business.bulkWrite(bulkOps, { ordered: false });
                    savedCount = uniqueBusinesses.length;
                    console.log(`Bulk write successful. Found ${savedCount} unique businesses`);
                } catch (e) {
                    console.error("Bulk write error:", e.message);
                }
            }

            await job.updateProgress(90);
            await Job.findOneAndUpdate({ jobId }, { progress: 90 });

            // Emit progress event
            if (io) {
                io.emit('job:progress', {
                    jobId,
                    progress: 90,
                    message: 'Finalizing...'
                });
            }

            await SearchHistory.create({
                userId,
                keyword,
                location,
                resultsCount: businesses.length,
            });

            await job.updateProgress(100);
            await Job.findOneAndUpdate(
                { jobId },
                {
                    status: 'completed',
                    progress: 100,
                    resultsCount: businesses.length,
                    completedAt: new Date(),
                }
            );

            // Emit job completed event
            if (io) {
                io.emit('job:completed', {
                    jobId,
                    resultsCount: businesses.length,
                    data: enrichedBusinesses
                });
            }

            return {
                success: true,
                count: savedCount,
                data: enrichedBusinesses,
            };
        } catch (error) {
            await Job.findOneAndUpdate(
                { jobId },
                {
                    status: 'failed',
                    error: error.message,
                }
            );

            // Emit job failed event
            if (io) {
                io.emit('job:failed', {
                    jobId,
                    error: error.message
                });
            }

            throw error;
        }
    },
    {
        connection,
        concurrency: 5,
        lockDuration: 600000, // 10 minutes (increased from default 30s to handle long email scraping)
        lockRenewTime: 30000,  // Renew lock every 30 seconds to keep job active
    }
);

searchWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
});

searchWorker.on('failed', (job, err) => {
    console.log(`❌ Job ${job.id} failed:`, err.message);
});

searchWorker.on('progress', (job, progress) => {
    console.log(`⏳ Job ${job.id} is ${progress}% complete`);
});

export default searchWorker;
