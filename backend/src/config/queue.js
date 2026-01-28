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

export { searchQueue, connection };
