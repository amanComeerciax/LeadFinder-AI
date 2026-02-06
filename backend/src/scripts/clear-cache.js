import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Business from '../models/Business.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: join(__dirname, '../../.env') });

const clearCache = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            console.error('❌ MONGO_URI not found in environment variables');
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Get Business model
        const Business = mongoose.model('Business');

        // Count before deletion
        const countBefore = await Business.countDocuments();
        console.log(`📊 Found ${countBefore} businesses in cache`);

        if (countBefore === 0) {
            console.log('🤷 Cache is already empty!');
            process.exit(0);
        }

        // Delete all businesses
        console.log('🗑️  Deleting all cached businesses...');
        const result = await Business.deleteMany({});

        console.log(`✅ Deleted ${result.deletedCount} businesses from cache`);
        console.log('🎉 Cache cleared successfully!');

        // Verify
        const countAfter = await Business.countDocuments();
        console.log(`📊 Businesses remaining: ${countAfter}`);

    } catch (error) {
        console.error('❌ Error clearing cache:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
};

clearCache();
