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
    },
    {
        timestamps: true,
    }
);

const Business = mongoose.model('Business', businessSchema);

export default Business;
