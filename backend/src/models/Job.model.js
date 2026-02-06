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
        // Two-phase search fields
        phase: {
            type: String,
            enum: ['collecting', 'enriching', 'completed'],
            default: 'collecting',
        },
        collectionProgress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        enrichmentProgress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        totalBusinesses: {
            type: Number,
            default: 0,
        },
        enrichedBusinesses: {
            type: Number,
            default: 0,
        },
        isPaused: {
            type: Boolean,
            default: false,
        },
        usePostalCodes: {
            type: Boolean,
            default: false,
        },
        postalCodes: {
            type: [String],
            default: [],
        },
        countryCode: {
            type: String,
            default: null,
        },
        searchStrategy: {
            type: String,
            enum: ['standard', 'postal', 'grid', 'cached'],
            default: 'standard',
        },
    },
    {
        timestamps: true,
    }
);

const Job = mongoose.model('Job', jobSchema);

export default Job;
