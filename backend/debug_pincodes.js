import mongoose from 'mongoose';
import PostalCode from './src/models/PostalCode.model.js';

const MONGO_URI = 'mongodb://localhost:27017/google-maps-scraper';

async function debug() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('--- Database Stats ---');
        const total = await PostalCode.countDocuments();
        console.log('Total Pincodes:', total);

        const inCount = await PostalCode.countDocuments({ countryCode: 'IN' });
        console.log('Total India Pincodes:', inCount);

        if (inCount > 0) {
            console.log('\n--- Sample India Data ---');
            const sample = await PostalCode.findOne({ countryCode: 'IN' });
            console.log(JSON.stringify(sample, null, 2));

            console.log('\n--- Sample for Ahmedabad ---');
            const ahmedabadSample = await PostalCode.find({
                countryCode: 'IN',
                $or: [
                    { placeName: /ahmedabad/i },
                    { adminName2: /ahmedabad/i }
                ]
            }).limit(5);
            console.log(JSON.stringify(ahmedabadSample, null, 2));
        } else {
            console.log('\n❌ No India pincodes found!');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

debug();
