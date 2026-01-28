import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
    {
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
        resultsCount: {
            type: Number,
            default: 0,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
