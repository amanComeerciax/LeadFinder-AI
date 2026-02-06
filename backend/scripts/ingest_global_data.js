
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import geonamesService from '../src/services/geonames.service.js';

dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/google-maps-scraper';
        console.log(`Connecting to: ${uri}`);
        await mongoose.connect(uri);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const runIngestion = async () => {
    await connectDB();

    console.log('Starting Global Data Ingestion...');
    console.log('NOTE: This process will download ~20MB zip file and ingest ~2 million records.');
    console.log('It may take several minutes depending on your internet and disk speed.');

    const result = await geonamesService.downloadAndIngestGlobal();

    if (result.success) {
        console.log('✅ Global ingestion process finished successfully!');
    } else {
        console.error('❌ Ingestion failed:', result.error);
    }

    process.exit(result.success ? 0 : 1);
};

runIngestion();
