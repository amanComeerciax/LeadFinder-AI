import express from 'express';
import { searchAndSaveBusinesses, createSearchJob, getJobStatus, getUserSearchHistory } from '../controllers/business.controller.js';

const router = express.Router();

// Synchronous search (original)
router.post('/search', searchAndSaveBusinesses);

// Asynchronous job-based search (new)
router.post('/search/job', createSearchJob);
router.get('/job/:jobId', getJobStatus);

// Search history
router.get('/history', getUserSearchHistory);

export default router;
