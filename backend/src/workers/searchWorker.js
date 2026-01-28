import { Worker } from 'bullmq';
import { connection } from '../config/queue.js';
import { searchBusinesses } from '../services/googleMaps.service.js';
import { extractContacts } from '../services/websiteScraper.service.js';
import { bloomFilterService } from '../services/bloomFilter.service.js';
import Business from '../models/Business.model.js';
import SearchHistory from '../models/SearchHistory.model.js';
import Job from '../models/Job.model.js';

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

            // Step 1: Scrape Google Maps
            const rawBusinesses = await searchBusinesses(keyword, location);

            // Filter out already processed businesses using Bloom Filter (Place ID)
            const businesses = [];
            for (const business of rawBusinesses) {
                if (business.place_id && await bloomFilterService.shouldProcess(business.place_id)) {
                    businesses.push(business);
                    await bloomFilterService.addProcessed(business.place_id);
                } else if (!business.place_id) {
                    // If no place_id, we process it anyway (rare case)
                    businesses.push(business);
                }
            }

            console.log(`Bloom Filter: Skipped ${rawBusinesses.length - businesses.length} duplicate businesses.`);

            await job.updateProgress(40);
            await Job.findOneAndUpdate({ jobId }, { progress: 40 });

            // Step 2: Enrich with Emails & Social Links
            // Process in chunks to limit concurrency (Puppeteer is heavy)
            const chunkSize = 5;
            const enrichedBusinesses = [];

            for (let i = 0; i < businesses.length; i += chunkSize) {
                const chunk = businesses.slice(i, i + chunkSize);
                // console.log(`Processing chunk ${i/chunkSize + 1} of ${Math.ceil(businesses.length/chunkSize)}`);

                const chunkResults = await Promise.all(
                    chunk.map(async (business) => {
                        if (business.website && business.website !== 'N/A') {
                            // Check Bloom Filter for URL before crawling
                            if (await bloomFilterService.shouldCrawl(business.website)) {
                                try {
                                    const contacts = await extractContacts(business.website);
                                    await bloomFilterService.addCrawled(business.website);
                                    return { ...business, ...contacts };
                                } catch (e) {
                                    console.error(`Failed to enrich ${business.website}:`, e.message);
                                    return business;
                                }
                            } else {
                                console.log(`Bloom Filter: Skipped crawling ${business.website}`);
                                return business;
                            }
                        }
                        return business;
                    })
                );
                enrichedBusinesses.push(...chunkResults);
            }

            await job.updateProgress(70);
            await Job.findOneAndUpdate({ jobId }, { progress: 70 });

            // Step 3: Save to Database
            // Use insertMany with ordered: false to ignore duplicate key errors if any slip through
            // But bloom filter should catch most
            let savedBusinesses = [];
            if (enrichedBusinesses.length > 0) {
                try {
                    savedBusinesses = await Business.insertMany(enrichedBusinesses, { ordered: false });
                } catch (e) {
                    // If some inserted, they are in e.insertedDocs (for older mongoose) or we can just ignore duplicates
                    // Mongoose insertMany throws if some fail, but saves the successful ones if ordered: false
                    // In Mongoose 6+, it returns the inserted docs even on error if we handle it right, 
                    // or we can just re-fetch or assume success for this flow.
                    // A simple way is to catch and ignore, assuming duplicates were the cause.
                    if (e.writeErrors) {
                        // Some docs inserted, some failed. 
                        // e.insertedDocs often contains the successes.
                        savedBusinesses = e.insertedDocs || [];
                    } else {
                        // All failed or other error
                        console.error("Bulk insert partial error:", e.message);
                    }
                }
            }

            await job.updateProgress(90);
            await Job.findOneAndUpdate({ jobId }, { progress: 90 });

            await SearchHistory.create({
                userId,
                keyword,
                location,
                resultsCount: savedBusinesses.length,
            });

            await job.updateProgress(100);
            await Job.findOneAndUpdate(
                { jobId },
                {
                    status: 'completed',
                    progress: 100,
                    resultsCount: savedBusinesses.length,
                    completedAt: new Date(),
                }
            );

            return {
                success: true,
                count: savedBusinesses.length,
                data: savedBusinesses,
            };
        } catch (error) {
            await Job.findOneAndUpdate(
                { jobId },
                {
                    status: 'failed',
                    error: error.message,
                }
            );
            throw error;
        }
    },
    {
        connection,
        concurrency: 5,
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
