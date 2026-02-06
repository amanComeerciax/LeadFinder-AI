import express from 'express';
import {
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
} from '../controllers/business.controller.js';
import requireAuth from '../middlewares/auth.middleware.js';

const router = express.Router();

// Synchronous search (original)
router.post('/search', requireAuth, searchAndSaveBusinesses);

// Asynchronous job-based search (original)
router.post('/search/job', requireAuth, createSearchJob);

// Two-phase search (new - with postal codes)
router.post('/search/two-phase', requireAuth, createTwoPhaseSearchJob);

// Job management
router.get('/job/:jobId', getJobStatus);
router.delete('/job/:jobId', requireAuth, cancelJob);

// Enrichment controls
router.post('/job/:jobId/pause', requireAuth, pauseEnrichment);
router.post('/job/:jobId/resume', requireAuth, resumeEnrichment);
router.post('/job/:jobId/skip-enrichment', requireAuth, skipEnrichment);

// Deep scan business website
router.post('/deep-scan/:businessId', requireAuth, deepScanBusiness);

// Search history
router.get('/history', requireAuth, getUserSearchHistory);
router.delete('/history/:id', requireAuth, deleteSearchHistory);

// Active jobs
router.get('/jobs/active', requireAuth, getActiveJobs);

export default router;

