import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Business from '../models/Business.model.js';
import SearchHistory from '../models/SearchHistory.model.js';
import Job from '../models/Job.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const clearBusinessData = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI not found in environment');
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected.\n');

        // Count before deletion
        const businessCount = await Business.countDocuments();
        const historyCount = await SearchHistory.countDocuments();
        const jobCount = await Job.countDocuments();

        console.log('📊 Current Data:');
        console.log(`   Businesses: ${businessCount}`);
        console.log(`   Search History: ${historyCount}`);
        console.log(`   Jobs: ${jobCount}\n`);

        // Delete all business-related data
        console.log('🗑️  Clearing business data...');

        const businessResult = await Business.deleteMany({});
        console.log(`   ✅ Deleted ${businessResult.deletedCount} businesses`);

        const historyResult = await SearchHistory.deleteMany({});
        console.log(`   ✅ Deleted ${historyResult.deletedCount} search history records`);

        const jobResult = await Job.deleteMany({});
        console.log(`   ✅ Deleted ${jobResult.deletedCount} job records`);

        console.log('\n✨ Business data cleared successfully!');
        console.log('💾 Postal codes data is safe and intact.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

clearBusinessData();
