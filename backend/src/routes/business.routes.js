import express from 'express';
import { searchAndSaveBusinesses, createSearchJob, getJobStatus, getUserSearchHistory, deepScanBusiness, cancelJob } from '../controllers/business.controller.js';
import requireAuth from '../middlewares/auth.middleware.js';

const router = express.Router();

// Synchronous search (original)
router.post('/search', requireAuth, searchAndSaveBusinesses);

// Asynchronous job-based search (new)
router.post('/search/job', requireAuth, createSearchJob);
router.get('/job/:jobId', getJobStatus);
router.delete('/job/:jobId', requireAuth, cancelJob);

// Deep scan business website
router.post('/deep-scan/:businessId', requireAuth, deepScanBusiness);

// Search history
router.get('/history', requireAuth, getUserSearchHistory);

export default router;
