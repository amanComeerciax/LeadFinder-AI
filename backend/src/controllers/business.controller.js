import Business from '../models/Business.model.js';
import SearchHistory from '../models/SearchHistory.model.js';
import Job from '../models/Job.model.js';
import { searchBusinesses } from '../services/googleMaps.service.js';
import { searchQueue } from '../config/queue.js';
import { v4 as uuidv4 } from 'uuid';

// Cache TTL: 12 hours
const CACHE_TTL = 12 * 60 * 60 * 1000;

/**
 * Check for fresh cached results in the database
 */
const checkCachedResults = async (keyword, location) => {
    const yesterday = new Date(Date.now() - CACHE_TTL);

    // Find businesses matching keyword and location updated in last 12h
    return await Business.find({
        keyword,
        location,
        updatedAt: { $gte: yesterday }
    }).sort({ updatedAt: -1 });
};

// Synchronous search (original)
const searchAndSaveBusinesses = async (req, res, next) => {
    try {
        const { keyword, location, refresh } = req.body;
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User ID not found',
            });
        }

        if (!keyword || !location) {
            return res.status(400).json({
                success: false,
                message: 'Keyword and location are required',
            });
        }

        // Check for cached results first (unless refresh is requested)
        if (!refresh) {
            const cachedResults = await checkCachedResults(keyword, location);
            if (cachedResults.length > 0) {
                console.log(`Serving ${cachedResults.length} cached results for: ${keyword} in ${location}`);

                await SearchHistory.create({
                    userId,
                    keyword,
                    location,
                    resultsCount: cachedResults.length,
                });

                return res.status(200).json({
                    success: true,
                    count: cachedResults.length,
                    data: cachedResults,
                    cached: true
                });
            }
        } else {
            console.log(`Force refresh requested for: ${keyword} in ${location}`);
        }

        const businesses = await searchBusinesses(keyword, location);

        // Use bulkWrite with upsert to prevent duplicates
        const bulkOps = businesses
            .filter(b => b.place_id)
            .map(business => ({
                updateOne: {
                    filter: { place_id: business.place_id },
                    update: { $set: business },
                    upsert: true
                }
            }));

        let savedCount = businesses.length;
        if (bulkOps.length > 0) {
            const result = await Business.bulkWrite(bulkOps, { ordered: false });
            savedCount = (result.upsertedCount || 0) + (result.modifiedCount || 0);
        }

        await SearchHistory.create({
            userId,
            keyword,
            location,
            resultsCount: savedCount,
        });

        res.status(200).json({
            success: true,
            count: savedCount,
            data: businesses,
        });
    } catch (error) {
        next(error);
    }
};

// Asynchronous job-based search (new)
const createSearchJob = async (req, res, next) => {
    try {
        const { keyword, location, refresh } = req.body;
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User ID not found',
            });
        }

        if (!keyword || !location) {
            return res.status(400).json({
                success: false,
                message: 'Keyword and location are required',
            });
        }

        // Check for cached results first (unless refresh is requested)
        if (!refresh) {
            const cachedResults = await checkCachedResults(keyword, location);
            if (cachedResults.length > 0) {
                console.log(`Serving cached results via job for: ${keyword} in ${location}`);
                const jobId = uuidv4();

                // Create a pre-completed job
                await Job.create({
                    jobId,
                    userId,
                    keyword,
                    location,
                    status: 'completed',
                    progress: 100,
                    resultsCount: cachedResults.length,
                    completedAt: new Date()
                });

                // Emit socket events immediately for cached results
                const { io } = await import('../server.js');
                if (io) {
                    // Emit started event
                    io.emit('job:started', {
                        jobId,
                        keyword,
                        location,
                        timestamp: new Date()
                    });

                    // Emit completed event with data
                    setTimeout(() => {
                        io.emit('job:completed', {
                            jobId,
                            resultsCount: cachedResults.length,
                            data: cachedResults
                        });
                    }, 100); // Small delay to ensure frontend is listening
                }

                return res.status(202).json({
                    success: true,
                    message: 'Search results retrieved from cache',
                    jobId,
                    cached: true
                });
            }
        } else {
            console.log(`Force refresh (async job) requested for: ${keyword} in ${location}`);
        }

        const jobId = uuidv4();

        // Create job record in database
        await Job.create({
            jobId,
            userId,
            keyword,
            location,
            status: 'queued',
        });

        // Add job to queue
        await searchQueue.add(
            'search',
            {
                jobId,
                userId,
                keyword,
                location,
            },
            {
                jobId,
            }
        );

        res.status(202).json({
            success: true,
            message: 'Search job created successfully',
            jobId,
        });
    } catch (error) {
        next(error);
    }
};

const getJobStatus = async (req, res, next) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findOne({ jobId });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        // If job is completed, fetch the results
        let data = null;
        if (job.status === 'completed') {
            // Fetch businesses updated around the time of job completion
            // This ensures we get the correct results for THIS specific job
            const jobCompletedTime = job.completedAt || job.createdAt;
            const searchWindowStart = new Date(jobCompletedTime.getTime() - 60000); // 1 minute before
            
            data = await Business.find({
                keyword: job.keyword,
                location: job.location,
                updatedAt: { 
                    $gte: searchWindowStart,
                    $lte: new Date(jobCompletedTime.getTime() + 60000) // 1 minute after
                }
            })
                .sort({ updatedAt: -1 })
                .limit(job.resultsCount || 100); // Fallback to 100 if resultsCount not set
        }

        res.status(200).json({
            success: true,
            job: {
                jobId: job.jobId,
                status: job.status,
                progress: job.progress,
                keyword: job.keyword,
                location: job.location,
                resultsCount: job.resultsCount,
                error: job.error,
                createdAt: job.createdAt,
                completedAt: job.completedAt,
            },
            data,
        });
    } catch (error) {
        next(error);
    }
};

const getUserSearchHistory = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User ID not found',
            });
        }
        const limit = parseInt(req.query.limit) || 10;

        const history = await SearchHistory.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);

        res.status(200).json({
            success: true,
            count: history.length,
            data: history,
        });
    } catch (error) {
        next(error);
    }
};

// Deep scan a business website to extract additional contact information
const deepScanBusiness = async (req, res, next) => {
    try {
        const { businessId } = req.params;

        // Find the business
        const business = await Business.findById(businessId);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found',
            });
        }

        // Check if business has a website
        if (!business.website || business.website === 'N/A') {
            return res.status(400).json({
                success: false,
                message: 'Business does not have a website to scan',
            });
        }

        // Update status to scanning
        business.deepScanStatus = 'scanning';
        await business.save();

        // Import the scraper (using dynamic import for ESM compatibility)
        const { scrapeWebsite } = await import('../../utils/websiteScraper.js');

        // Perform the deep scan
        const scanResult = await scrapeWebsite(business.website);

        if (scanResult.success) {
            // Update business with extracted data
            business.deepScanStatus = 'complete';
            business.deepScanDate = new Date();
            business.deepScanData = {
                extractedEmails: scanResult.extractedEmails || [],
                extractedPhones: scanResult.extractedPhones || [],
                extractedSocialLinks: scanResult.extractedSocialLinks || {},
                contactPageUrl: scanResult.contactPageUrl,
                metadata: scanResult.metadata,
            };

            // Merge extracted data with existing data
            // If we found better email, update main email field
            if (scanResult.extractedEmails && scanResult.extractedEmails.length > 0) {
                if (!business.email || business.email === 'N/A') {
                    business.email = scanResult.extractedEmails[0];
                }
            }

            // Merge social links (prefer deep scan data if available)
            if (scanResult.extractedSocialLinks) {
                Object.keys(scanResult.extractedSocialLinks).forEach(platform => {
                    if (scanResult.extractedSocialLinks[platform] && !business.socialLinks[platform]) {
                        business.socialLinks[platform] = scanResult.extractedSocialLinks[platform];
                    }
                });
            }

            // If we found phone numbers and business doesn't have one
            if (scanResult.extractedPhones && scanResult.extractedPhones.length > 0) {
                if (!business.phone || business.phone === 'N/A') {
                    business.phone = scanResult.extractedPhones[0];
                }
            }

            await business.save();

            res.status(200).json({
                success: true,
                message: 'Deep scan completed successfully',
                data: {
                    business,
                    scanResults: scanResult,
                },
            });
        } else {
            // Scan failed
            business.deepScanStatus = 'error';
            business.deepScanDate = new Date();
            await business.save();

            res.status(500).json({
                success: false,
                message: 'Deep scan failed',
                error: scanResult.error,
            });
        }
    } catch (error) {
        // Update status to error
        try {
            const { businessId } = req.params;
            await Business.findByIdAndUpdate(businessId, {
                deepScanStatus: 'error',
                deepScanDate: new Date(),
            });
        } catch (updateError) {
            console.error('Failed to update business scan status:', updateError);
        }

        next(error);
    }
};

// Cancel a running job
const cancelJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User ID not found',
            });
        }

        // Find job in database
        const job = await Job.findOne({ jobId });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        // Verify ownership
        if (job.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You do not own this job',
            });
        }

        // Check if job is already completed or failed
        if (job.status === 'completed' || job.status === 'failed') {
            return res.status(400).json({
                success: false,
                message: `Job already ${job.status}`,
            });
        }

        // Get BullMQ job and remove it
        const bullJob = await searchQueue.getJob(jobId);
        if (bullJob) {
            await bullJob.remove();
            console.log(`🛑 Cancelled BullMQ job: ${jobId}`);
        }

        // Update database status
        await Job.findOneAndUpdate(
            { jobId },
            {
                status: 'cancelled',
                completedAt: new Date(),
            }
        );

        // Emit socket event (imported from worker)
        const { io } = await import('../server.js');
        if (io) {
            io.emit('job:cancelled', {
                jobId,
                message: 'Job cancelled by user'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job cancelled successfully',
        });
    } catch (error) {
        next(error);
    }
};

export { searchAndSaveBusinesses, createSearchJob, getJobStatus, getUserSearchHistory, deepScanBusiness, cancelJob };
