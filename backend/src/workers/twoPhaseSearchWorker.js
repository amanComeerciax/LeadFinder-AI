import { Worker } from 'bullmq';
import { connection } from '../config/queue.js';
import { searchBusinessesWithPostalCodes, getPlaceDetails } from '../services/googleMaps.service.js';
import { getPostalCodesByLocation, isPostalCodeSearchSupported } from '../services/postalCode.service.js';
import { extractContacts } from '../services/websiteScraper.service.js';
import Business from '../models/Business.model.js';
import SearchHistory from '../models/SearchHistory.model.js';
import Job from '../models/Job.model.js';

// Import io - will be set after server initialization
let io = null;
export const setSocketIO = (socketIO) => {
    io = socketIO;
};

const twoPhaseSearchWorker = new Worker(
    'two-phase-search',
    async (job) => {
        const { keyword, location, userId, jobId } = job.data;

        try {
            console.log(`\n🚀 [Two-Phase Worker] Starting job ${jobId}`);
            console.log(`📍 Keyword: "${keyword}", Location: "${location}"`);

            // ==============================================
            // PHASE 1: COLLECT BUSINESS LISTINGS (FAST)
            // ==============================================

            await Job.findOneAndUpdate(
                { jobId },
                {
                    status: 'processing',
                    phase: 'collecting',
                    progress: 5,
                    collectionProgress: 5
                }
            );

            await job.updateProgress(5);

            // Emit job started event
            if (io) {
                io.emit('job:started', {
                    jobId,
                    keyword,
                    location,
                    phase: 'collecting',
                    timestamp: new Date()
                });
            }

            // Check if postal code search is supported
            let usePostalCodes = isPostalCodeSearchSupported(location);
            console.log(`📮 [Phase 1] Postal code search supported: ${usePostalCodes}`);

            let businesses = [];

            if (usePostalCodes) {
                // Get postal codes for the location
                console.log(`📮 [Phase 1] Fetching postal codes for: ${location}`);
                const postalCodes = await getPostalCodesByLocation(location);

                if (postalCodes.length > 0) {
                    console.log(`📮 [Phase 1] Found ${postalCodes.length} postal codes`);

                    // Update job with postal codes info
                    await Job.findOneAndUpdate(
                        { jobId },
                        {
                            usePostalCodes: true,
                            postalCodes,
                            searchStrategy: 'postal'
                        }
                    );

                    // Search using postal codes (light mode - no enrichment)
                    businesses = await searchBusinessesWithPostalCodes(
                        keyword,
                        postalCodes,
                        location,
                        true, // light mode
                        // Progress callback
                        async (progress) => {
                            // Check for cancellation or pause
                            const currentJob = await Job.findOne({ jobId });
                            if (currentJob && currentJob.status === 'cancelled') {
                                console.log(`🛑 [Phase 1] Job ${jobId} cancelled. terminating search.`);
                                return true; // Signal cancellation
                            }

                            if (currentJob && currentJob.isPaused) {
                                console.log(`⏸️  [Phase 1] Job is paused, waiting...`);
                                while (true) {
                                    await new Promise(resolve => setTimeout(resolve, 2000));
                                    const updatedJob = await Job.findOne({ jobId });
                                    if (!updatedJob || !updatedJob.isPaused) break;
                                    if (updatedJob.status === 'cancelled') return true;
                                }
                                console.log(`▶️  [Phase 1] Job resumed`);
                            }

                            const collectionProgress = Math.min(5 + Math.floor((progress.progress / 100) * 40), 45);

                            await Job.findOneAndUpdate(
                                { jobId },
                                {
                                    collectionProgress,
                                    progress: collectionProgress
                                }
                            );

                            if (io) {
                                io.emit('job:collection:progress', {
                                    jobId,
                                    progress: collectionProgress,
                                    postalCodesProcessed: progress.processed,
                                    totalPostalCodes: progress.total,
                                    businessesFound: progress.found,
                                    message: `Searching ${progress.processed}/${progress.total} postal codes...`
                                });
                            }
                        }
                    );
                } else {
                    console.warn(`📮 [Phase 1] No postal codes found, falling back to standard search`);
                    usePostalCodes = false;
                }
            }

            // Fallback to standard search if postal codes not available
            if (!usePostalCodes || businesses.length === 0) {
                console.log(`🔍 [Phase 1] Using standard Google Places search`);
                const { searchBusinesses } = await import('../services/googleMaps.service.js');
                businesses = await searchBusinesses(keyword, location);

                await Job.findOneAndUpdate(
                    { jobId },
                    { searchStrategy: 'standard' }
                );
            }

            // Save businesses to database (basic data only)
            let savedCount = 0;
            if (businesses.length > 0) {
                try {
                    // Deduplicate by place_id immediately
                    const uniqueBusinesses = Array.from(
                        new Map(businesses.map(b => [b.place_id, b])).values()
                    ).filter(b => b.place_id);

                    // Update our working array to be the unique list
                    businesses = uniqueBusinesses;
                    savedCount = businesses.length;

                    const bulkOps = uniqueBusinesses.map(business => ({
                        updateOne: {
                            filter: { place_id: business.place_id },
                            update: { $set: business },
                            upsert: true
                        }
                    }));

                    await Business.bulkWrite(bulkOps, { ordered: false });
                    console.log(`💾 [Phase 1] Database update complete. Found ${savedCount} unique businesses`);
                } catch (e) {
                    console.error("❌ [Phase 1] Bulk write error:", e.message);
                    // Even if DB save fails, we continue with whatever unique ones we have
                    businesses = Array.from(
                        new Map(businesses.map(b => [b.place_id, b])).values()
                    ).filter(b => b.place_id);
                    savedCount = businesses.length;
                }
            }

            // Update job - Phase 1 complete
            await Job.findOneAndUpdate(
                { jobId },
                {
                    phase: 'enriching',
                    collectionProgress: 100,
                    progress: 50,
                    totalBusinesses: savedCount,
                    resultsCount: savedCount // Update this so UI shows leads found
                }
            );

            // Emit Phase 1 complete
            if (io) {
                io.emit('job:phase:completed', {
                    jobId,
                    phase: 'collecting',
                    businessesFound: savedCount,
                    data: businesses
                });

                io.emit('job:phase:started', {
                    jobId,
                    phase: 'enriching',
                    totalBusinesses: savedCount
                });
            }

            console.log(`\n🔍 [Phase 2] Starting enrichment for ${businesses.length} businesses...`);

            // ==============================================
            // PHASE 2: ENRICH WITH CONTACT DETAILS
            // ==============================================

            const chunkSize = 3;
            const enrichedBusinesses = [];
            let enrichedCount = 0;

            for (let i = 0; i < businesses.length; i += chunkSize) {
                // Check if job is cancelled
                const checkJob = await Job.findOne({ jobId });
                if (checkJob && checkJob.status === 'cancelled') {
                    console.log(`🛑 [Phase 2] Job ${jobId} cancelled. stopping enrichment.`);
                    return { success: false, status: 'cancelled' };
                }

                // Check if job is paused
                const currentJob = await Job.findOne({ jobId });
                if (currentJob && currentJob.isPaused) {
                    console.log(`⏸️  [Phase 2] Job is paused, waiting...`);

                    // Wait in a loop until unpaused or cancelled
                    while (true) {
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Check every 2 seconds
                        const updatedJob = await Job.findOne({ jobId });

                        if (!updatedJob || !updatedJob.isPaused) {
                            console.log(`▶️  [Phase 2] Job resumed or record missing`);
                            break;
                        }

                        if (updatedJob && (updatedJob.status === 'cancelled' || updatedJob.status === 'failed')) {
                            console.log(`🛑 [Phase 2] Job cancelled or failed`);
                            return;
                        }
                    }
                }

                const chunk = businesses.slice(i, i + chunkSize);
                const enrichmentProgress = Math.floor((i / businesses.length) * 50);
                const overallProgress = 50 + enrichmentProgress;

                await Job.findOneAndUpdate(
                    { jobId },
                    {
                        enrichmentProgress,
                        progress: overallProgress,
                        enrichedBusinesses: enrichedCount
                    }
                );

                // Emit progress
                if (io) {
                    io.emit('job:enrichment:progress', {
                        jobId,
                        progress: enrichmentProgress,
                        enriched: enrichedCount,
                        total: businesses.length,
                        message: `Enriching ${i + 1}-${Math.min(i + chunkSize, businesses.length)} of ${businesses.length}...`
                    });
                }

                // Enrich chunk
                const chunkResults = await Promise.all(
                    chunk.map(async (business) => {
                        try {
                            console.log(`🔍 [Phase 2] Enriching: ${business.name}`);

                            let website = business.website;
                            let phone = business.phone;

                            // If website is missing, fetch place details first
                            if (!website || website === 'N/A') {
                                console.log(`📡 [Phase 2] Fetching details for: ${business.name}`);
                                const details = await getPlaceDetails(business.place_id);
                                website = details.website || 'N/A';
                                phone = details.phone || business.phone;
                            }

                            if (website && website !== 'N/A') {
                                // Frequent cancellation check for deep scanning
                                const checkCancellation = async () => {
                                    const currentJob = await Job.findOne({ jobId });
                                    return currentJob && currentJob.status === 'cancelled';
                                };

                                const contacts = await extractContacts(website, checkCancellation, jobId);

                                return {
                                    ...business,
                                    website,
                                    phone,
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
                            } else {
                                // No website found even after details fetch
                                return { ...business, website, phone };
                            }
                        } catch (e) {
                            console.error(`❌ [Phase 2] Failed to enrich ${business.name}:`, e.message);
                            return business;
                        }
                    })
                );

                enrichedBusinesses.push(...chunkResults);
                enrichedCount += chunkResults.length;

                // Update businesses in database with enriched data
                try {
                    const enrichedBulkOps = chunkResults
                        .filter(b => b.place_id)
                        .map(business => ({
                            updateOne: {
                                filter: { place_id: business.place_id },
                                update: { $set: business },
                                upsert: false
                            }
                        }));

                    if (enrichedBulkOps.length > 0) {
                        await Business.bulkWrite(enrichedBulkOps, { ordered: false });
                    }
                } catch (e) {
                    console.error("❌ [Phase 2] Enrichment bulk write error:", e.message);
                }

                // Emit individual business enriched events
                if (io) {
                    for (const business of chunkResults) {
                        io.emit('job:business:enriched', {
                            jobId,
                            business
                        });
                    }
                }
            }

            console.log(`✅ [Phase 2] Enrichment complete. Enriched ${enrichedCount} businesses`);

            // Final progress update
            await Job.findOneAndUpdate(
                { jobId },
                {
                    status: 'completed',
                    phase: 'completed',
                    progress: 100,
                    collectionProgress: 100,
                    enrichmentProgress: 100,
                    resultsCount: savedCount,
                    enrichedBusinesses: enrichedCount,
                    completedAt: new Date(),
                }
            );

            // Create search history
            await SearchHistory.create({
                userId,
                keyword,
                location,
                resultsCount: savedCount,
            });

            // Emit job completed
            if (io) {
                io.emit('job:completed', {
                    jobId,
                    resultsCount: businesses.length, // Use current search total
                    enrichedCount,
                    data: enrichedBusinesses
                });
            }

            console.log(`✅ [Two-Phase Worker] Job ${jobId} completed successfully\n`);

            return {
                success: true,
                count: savedCount,
                enrichedCount,
                data: enrichedBusinesses,
            };

        } catch (error) {
            console.error(`❌ [Two-Phase Worker] Job ${jobId} failed:`, error.message);

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
        concurrency: 3,
        lockDuration: 1800000, // 30 minutes for long-running jobs
        lockRenewTime: 30000,
    }
);

twoPhaseSearchWorker.on('completed', (job) => {
    console.log(`✅ Two-Phase Job ${job.id} completed successfully`);
});

twoPhaseSearchWorker.on('failed', (job, err) => {
    console.log(`❌ Two-Phase Job ${job.id} failed:`, err.message);
});

twoPhaseSearchWorker.on('progress', (job, progress) => {
    console.log(`⏳ Two-Phase Job ${job.id} is ${progress}% complete`);
});

export default twoPhaseSearchWorker;
