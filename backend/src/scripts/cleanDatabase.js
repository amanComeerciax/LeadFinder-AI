import mongoose from 'mongoose';
import { connection } from '../config/queue.js';
import Business from '../models/Business.model.js';
import SearchHistory from '../models/SearchHistory.model.js';
import Job from '../models/Job.model.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanDatabase = async () => {
    try {
        console.log('🧹 Starting database cleanup...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected\n');

        // Clean collections
        const businessCount = await Business.countDocuments();
        const jobCount = await Job.countDocuments();
        const historyCount = await SearchHistory.countDocuments();

        console.log('📊 Current Data:');
        console.log(`   - Businesses: ${businessCount}`);
        console.log(`   - Jobs: ${jobCount}`);
        console.log(`   - Search History: ${historyCount}\n`);

        // Delete all data
        console.log('🗑️  Deleting all data...');
        await Business.deleteMany({});
        console.log('   ✅ Businesses cleared');

        await Job.deleteMany({});
        console.log('   ✅ Jobs cleared');

        await SearchHistory.deleteMany({});
        console.log('   ✅ Search History cleared');

        // Clear Bloom Filter from Redis
        console.log('\n🧹 Clearing Bloom Filter from Redis...');
        const bloomFilterKey = 'bloom:place_id_filter';
        const deleted = await connection.del(bloomFilterKey);

        if (deleted) {
            console.log('   ✅ Bloom Filter cleared from Redis');
        } else {
            console.log('   ℹ️  No Bloom Filter found in Redis (already clean)');
        }

        // Clear BullMQ queues (optional)
        console.log('\n🧹 Clearing job queues...');
        const queueKeys = await connection.keys('bull:business-search:*');
        if (queueKeys.length > 0) {
            await connection.del(...queueKeys);
            console.log(`   ✅ Cleared ${queueKeys.length} queue keys`);
        } else {
            console.log('   ℹ️  No queue data found (already clean)');
        }

        console.log('\n✨ Database cleanup completed successfully!');
        console.log('\n📊 Final Data:');
        console.log(`   - Businesses: ${await Business.countDocuments()}`);
        console.log(`   - Jobs: ${await Job.countDocuments()}`);
        console.log(`   - Search History: ${await SearchHistory.countDocuments()}\n`);

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        // Close connections
        await mongoose.connection.close();
        await connection.quit();
        console.log('👋 Connections closed');
        process.exit(0);
    }
};

cleanDatabase();
