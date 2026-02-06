import Business from '../models/Business.model.js';
import SearchHistory from '../models/SearchHistory.model.js';
import Job from '../models/Job.model.js';
import { searchBusinesses } from '../services/googleMaps.service.js';
import { searchQueue, twoPhaseSearchQueue, enrichmentQueue } from '../config/queue.js';
import { isPostalCodeSearchSupported } from '../services/postalCode.service.js';
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
            // Fetch all businesses for this keyword and location
            // Removed time-based filtering to prevent data loss during long-running deep scans
            data = await Business.find({
                keyword: job.keyword,
                location: job.location
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
            console.warn(`[Cancel Job] Job not found: ${jobId}`);
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        console.log(`[Cancel Job] Verifying ownership: AuthUser=${userId}, JobOwner=${job.userId}`);

        // Verify ownership
        if (job.userId !== userId) {
            console.error(`[Cancel Job] Ownership mismatch! AuthUser=${userId} tried to cancel job owned by ${job.userId}`);
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

        // BullMQ jobs are retrieved from their respective queues
        console.log(`[Cancel Job] Checking queues for job: ${jobId}`);

        try {
            // Priority list of queues to check for the job
            const queues = [
                { name: 'searchQueue', instance: searchQueue },
                { name: 'twoPhaseSearchQueue', instance: twoPhaseSearchQueue },
                { name: 'enrichmentQueue', instance: enrichmentQueue }
            ];

            let foundInQueue = false;

            for (const queue of queues) {
                try {
                    const bullJob = await queue.instance.getJob(jobId);
                    if (bullJob) {
                        foundInQueue = true;
                        // Attempt to remove the job
                        // This might fail with "locked by another worker" if currently processing
                        await bullJob.remove();
                        console.log(`🛑 Removed job ${jobId} from ${queue.name}`);
                        break;
                    }
                } catch (queueItemError) {
                    if (queueItemError.message.includes('locked')) {
                        console.log(`⚠️ Job ${jobId} in ${queue.name} is currently locked (active). It will stop itself via DB status check.`);
                        foundInQueue = true;
                        break;
                    }
                    throw queueItemError; // Re-throw other errors
                }
            }

            if (!foundInQueue) {
                console.log(`[Cancel Job] BullMQ job not found in any queue: ${jobId}`);
            }
        } catch (queueError) {
            console.error(`[Cancel Job] BullMQ Interaction Error:`, queueError);
            // We continue even if BullMQ fails, as we still want to update DB status
        }

        // Update database status
        console.log(`[Cancel Job] Updating DB status for: ${jobId}`);
        await Job.findOneAndUpdate(
            { jobId },
            {
                status: 'cancelled',
                completedAt: new Date(),
            }
        );

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            console.log(`[Cancel Job] Emitting socket cancellation for: ${jobId}`);
            io.emit('job:cancelled', {
                jobId,
                message: 'Job cancelled by user'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Job cancelled successfully',
        });
    } catch (error) {
        console.error('[Cancel Job] Global Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel job',
            error: error.message
        });
    }
};

/**
 * Create a two-phase search job (postal code based)
 * POST /api/business/search/two-phase
 */
const createTwoPhaseSearchJob = async (req, res, next) => {
    try {
        const { keyword, location, refresh = false } = req.body;
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

        // Check if postal code search is supported

        // Check if postal code search is supported
        const postalCodeSupported = isPostalCodeSearchSupported(location);
        console.log(`Postal code search supported for "${location}": ${postalCodeSupported}`);

        // Check for cached results first (unless refresh is requested)
        if (!refresh) {
            const cachedResults = await checkCachedResults(keyword, location);
            if (cachedResults.length > 0) {
                console.log(`Returning ${cachedResults.length} cached results`);

                const jobId = uuidv4();

                // Create a pre-completed job for cached results
                await Job.create({
                    jobId,
                    userId,
                    keyword,
                    location,
                    status: 'completed',
                    phase: 'completed',
                    progress: 100,
                    collectionProgress: 100,
                    enrichmentProgress: 100,
                    resultsCount: cachedResults.length,
                    totalBusinesses: cachedResults.length,
                    enrichedBusinesses: cachedResults.length,
                    completedAt: new Date(),
                    searchStrategy: 'cached'
                });

                // Emit completed event with data after a small delay to ensure frontend is listening
                if (req.app.get('io')) {
                    setTimeout(() => {
                        req.app.get('io').emit('job:completed', {
                            jobId,
                            cached: true,
                            resultsCount: cachedResults.length,
                            data: cachedResults
                        });
                    }, 100);
                }

                return res.status(202).json({
                    success: true,
                    message: 'Search results retrieved from cache',
                    jobId,
                    cached: true
                });
            }
        } else {
            console.log(`Force refresh requested for: ${keyword} in ${location}`);
        }

        const jobId = uuidv4();

        // Create job record in database
        await Job.create({
            jobId,
            userId,
            keyword,
            location,
            status: 'queued',
            phase: 'collecting',
            usePostalCodes: postalCodeSupported,
            searchStrategy: postalCodeSupported ? 'postal' : 'standard'
        });

        // Add job to two-phase search queue
        await twoPhaseSearchQueue.add(
            'two-phase-search',
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
            message: 'Two-phase search job created successfully',
            jobId,
            usePostalCodes: postalCodeSupported
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Pause enrichment phase of a job
 * POST /api/business/jobs/:jobId/pause
 */
const pauseEnrichment = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User ID not found',
            });
        }

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

        // Allow skipping in any active phase
        const activePhases = ['collecting', 'enriching'];
        if (!activePhases.includes(job.phase)) {
            return res.status(400).json({
                success: false,
                message: `Cannot skip job in ${job.phase} phase`,
            });
        }

        await Job.findOneAndUpdate(
            { jobId },
            { isPaused: true }
        );

        // Emit paused event
        if (req.app.get('io')) {
            req.app.get('io').emit('job:paused', { jobId });
        }

        res.status(200).json({
            success: true,
            message: 'Job paused successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Resume enrichment phase of a job
 * POST /api/business/jobs/:jobId/resume
 */
const resumeEnrichment = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User ID not found',
            });
        }

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

        // Allow skipping in any active phase
        const activePhases = ['collecting', 'enriching'];
        if (!activePhases.includes(job.phase)) {
            return res.status(400).json({
                success: false,
                message: `Cannot skip job in ${job.phase} phase`,
            });
        }

        if (!job.isPaused) {
            return res.status(400).json({
                success: false,
                message: 'Job is not paused',
            });
        }

        await Job.findOneAndUpdate(
            { jobId },
            { isPaused: false }
        );

        // Emit resumed event
        if (req.app.get('io')) {
            req.app.get('io').emit('job:resumed', { jobId });
        }

        res.status(200).json({
            success: true,
            message: 'Job resumed successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Skip enrichment phase of a job
 * POST /api/business/jobs/:jobId/skip-enrichment
 */
const skipEnrichment = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User ID not found',
            });
        }

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

        if (job.phase === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Job is already completed',
            });
        }

        // Allow skipping in any active phase
        const activePhases = ['collecting', 'enriching'];
        if (!activePhases.includes(job.phase)) {
            return res.status(400).json({
                success: false,
                message: `Cannot skip job in ${job.phase} phase`,
            });
        }

        await Job.findOneAndUpdate(
            { jobId },
            {
                phase: 'completed',
                status: 'completed',
                progress: 100,
                enrichmentProgress: 0,
                completedAt: new Date(),
            }
        );

        // Emit skipped event
        if (req.app.get('io')) {
            req.app.get('io').emit('job:enrichment:skipped', { jobId });
        }

        res.status(200).json({
            success: true,
            message: 'Enrichment skipped successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a search history entry
 * DELETE /api/business/history/:id
 */
const deleteSearchHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User ID not found',
            });
        }

        const history = await SearchHistory.findById(id);

        if (!history) {
            return res.status(404).json({
                success: false,
                message: 'History entry not found',
            });
        }

        // Verify ownership
        if (history.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You do not own this history entry',
            });
        }

        await SearchHistory.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'History entry deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all active jobs for the current user
 * GET /api/business/jobs/active
 */
const getActiveJobs = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User ID not found',
            });
        }

        // Find jobs with status 'queued' or 'processing'
        const activeJobs = await Job.find({
            userId,
            status: { $in: ['queued', 'processing'] }
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: activeJobs.length,
            data: activeJobs,
        });
    } catch (error) {
        next(error);
    }
};

export {
    searchAndSaveBusinesses,
    createSearchJob,
    createTwoPhaseSearchJob,
    pauseEnrichment,
    resumeEnrichment,
    skipEnrichment,
    getJobStatus,
    getUserSearchHistory,
    deepScanBusiness,
    cancelJob,
    deleteSearchHistory,
    getActiveJobs
};

