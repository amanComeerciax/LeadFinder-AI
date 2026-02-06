import mongoose from 'mongoose';
import dotenv from 'dotenv';
import geonamesService from '../services/geonames.service.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seed = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI not found in environment');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        // Top 10 countries by economy/business activity
        const countries = [
            'US',  // United States
            'IN',  // India
            'GB',  // United Kingdom
            'CA',  // Canada
            'DE',  // Germany
            'FR',  // France
            'AU',  // Australia
            'JP',  // Japan
            'BR',  // Brazil
            'MX'   // Mexico
        ];

        for (const country of countries) {
            console.log(`Starting ingestion for ${country}...`);
            const result = await geonamesService.downloadAndIngestCountry(country);
            if (result.success) {
                console.log(`Successfully ingested ${country}`);
            } else {
                console.log(`Failed to ingest ${country}: ${result.error}`);
            }
        }

        console.log('Seed task finished.');
        process.exit(0);
    } catch (error) {
        console.error('Seed Error:', error.message);
        process.exit(1);
    }
};

seed();
