import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const clearData = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI not found in environment');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        console.log('Clearing scrape-related collections...');

        const collections = ['businesses', 'jobs', 'searchhistories'];

        for (const collName of collections) {
            try {
                await mongoose.connection.collection(collName).deleteMany({});
                console.log(`- Cleared ${collName}`);
            } catch (err) {
                console.warn(`- Could not clear ${collName}: ${err.message}`);
            }
        }

        console.log('\nNOTE: PostalCode collection was NOT cleared to preserve GeoNames data.');
        console.log('Database cleanup finished.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup Error:', error.message);
        process.exit(1);
    }
};

clearData();
