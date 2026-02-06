import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null,
});

const searchQueue = new Queue('business-search', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: {
            age: 3600, // Keep completed jobs for 1 hour
            count: 100,
        },
        removeOnFail: {
            age: 24 * 3600, // Keep failed jobs for 24 hours
        },
    },
});

const twoPhaseSearchQueue = new Queue('two-phase-search', {
    connection,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: {
            age: 7200, // Keep completed jobs for 2 hours
            count: 50,
        },
        removeOnFail: {
            age: 48 * 3600, // Keep failed jobs for 48 hours
        },
    },
});

const enrichmentQueue = new Queue('enrichment-task', {
    connection,
    defaultJobOptions: {
        attempts: 1,
        removeOnComplete: {
            age: 3600,
            count: 100,
        },
        removeOnFail: {
            age: 24 * 3600,
        },
    },
});

export { searchQueue, twoPhaseSearchQueue, enrichmentQueue, connection };
