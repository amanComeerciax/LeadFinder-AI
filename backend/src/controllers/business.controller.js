import Business from '../models/Business.model.js';
import SearchHistory from '../models/SearchHistory.model.js';
import Job from '../models/Job.model.js';
import { searchBusinesses } from '../services/googleMaps.service.js';
import { searchQueue } from '../config/queue.js';
import { v4 as uuidv4 } from 'uuid';

// Synchronous search (original)
const searchAndSaveBusinesses = async (req, res, next) => {
    try {
        const { keyword, location } = req.body;
        const userId = req.auth?.userId || 'anonymous';

        if (!keyword || !location) {
            return res.status(400).json({
                success: false,
                message: 'Keyword and location are required',
            });
        }

        const businesses = await searchBusinesses(keyword, location);
        const savedBusinesses = await Business.insertMany(businesses);

        await SearchHistory.create({
            userId,
            keyword,
            location,
            resultsCount: savedBusinesses.length,
        });

        res.status(200).json({
            success: true,
            count: savedBusinesses.length,
            data: savedBusinesses,
        });
    } catch (error) {
        next(error);
    }
};

// Asynchronous job-based search (new)
const createSearchJob = async (req, res, next) => {
    try {
        const { keyword, location } = req.body;
        const userId = req.auth?.userId || 'anonymous';

        if (!keyword || !location) {
            return res.status(400).json({
                success: false,
                message: 'Keyword and location are required',
            });
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
            data = await Business.find({
                keyword: job.keyword,
                location: job.location,
            })
                .sort({ createdAt: -1 })
                .limit(job.resultsCount);
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
        const userId = req.auth?.userId || 'anonymous';
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

export { searchAndSaveBusinesses, createSearchJob, getJobStatus, getUserSearchHistory };
