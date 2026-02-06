import mongoose from 'mongoose';

const postalCodeSchema = new mongoose.Schema({
    countryCode: {
        type: String,
        required: true,
        index: true,
        uppercase: true
    },
    postalCode: {
        type: String,
        required: true,
        index: true
    },
    placeName: {
        type: String,
        required: true,
        index: true
    },
    adminName1: {
        type: String,
        index: true
    },
    adminCode1: {
        type: String,
        index: true
    },
    adminName2: {
        type: String
    },
    adminCode2: {
        type: String
    },
    adminName3: {
        type: String
    },
    adminCode3: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    accuracy: {
        type: Number
    }
}, {
    timestamps: true
});

// Composite index for efficient lookups
postalCodeSchema.index({ countryCode: 1, postalCode: 1 });
postalCodeSchema.index({ countryCode: 1, adminName1: 1, placeName: 1 });

const PostalCode = mongoose.model('PostalCode', postalCodeSchema);

export default PostalCode;
