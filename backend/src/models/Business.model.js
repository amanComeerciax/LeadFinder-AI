import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            default: 'N/A',
        },
        website: {
            type: String,
            default: 'N/A',
        },
        rating: {
            type: Number,
            default: 0,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        location: {
            type: String,
            required: true,
        },
        keyword: {
            type: String,
            required: true,
        },
        source: {
            type: String,
            default: 'Google Maps',
        },
        latitude: {
            type: Number,
            default: null,
        },
        longitude: {
            type: Number,
            default: null,
        },
        place_id: {
            type: String,
            default: null,
        },
        googleMapsUrl: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            default: null,
        },
        socialLinks: {
            facebook: { type: String, default: null },
            twitter: { type: String, default: null },
            linkedin: { type: String, default: null },
            instagram: { type: String, default: null },
            youtube: { type: String, default: null },
        },
        // Flat social URL fields for easier frontend access
        facebookUrl: { type: String, default: null },
        twitterUrl: { type: String, default: null },
        linkedinUrl: { type: String, default: null },
        instagramUrl: { type: String, default: null },
        youtubeUrl: { type: String, default: null },
        // New fields for enhanced UI
        photoUrl: {
            type: String,
            default: null,
        },
        category: {
            type: String,
            default: null,
        },
        hours: {
            type: String,
            default: null,
        },
        openingHours: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        // Deep Scan fields
        deepScanStatus: {
            type: String,
            enum: ['pending', 'scanning', 'complete', 'error', null],
            default: null,
        },
        deepScanDate: {
            type: Date,
            default: null,
        },
        deepScanData: {
            extractedEmails: {
                type: [String],
                default: [],
            },
            extractedPhones: {
                type: [String],
                default: [],
            },
            extractedSocialLinks: {
                facebook: { type: String, default: null },
                twitter: { type: String, default: null },
                linkedin: { type: String, default: null },
                instagram: { type: String, default: null },
                youtube: { type: String, default: null },
            },
            contactPageUrl: {
                type: String,
                default: null,
            },
            metadata: {
                type: mongoose.Schema.Types.Mixed,
                default: null,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Add unique index on place_id to prevent duplicates at database level
// Sparse index means null values won't be checked for uniqueness
businessSchema.index({ place_id: 1 }, { unique: true, sparse: true });

// Add index for keyword and location for optimized search caching
businessSchema.index({ keyword: 1, location: 1 });

const Business = mongoose.model('Business', businessSchema);

export default Business;
