import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
    {
        jobId: {
            type: String,
            required: true,
            unique: true,
        },
        userId: {
            type: String,
            default: 'anonymous',
        },
        keyword: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['queued', 'processing', 'completed', 'failed'],
            default: 'queued',
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        resultsCount: {
            type: Number,
            default: 0,
        },
        error: {
            type: String,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Job = mongoose.model('Job', jobSchema);

export default Job;
