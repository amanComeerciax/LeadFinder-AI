import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Business from '../models/Business.model.js';
import { extractContacts } from '../services/websiteScraper.service.js';

// Load environment variables
dotenv.config();

const BATCH_SIZE = 5; // Process 5 businesses at a time to avoid overwhelming Puppeteer

async function rescrapeBusinesses() {
    console.log('🚀 Starting migration: Re-scraping existing businesses for contact information...\n');

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all businesses that need contact information
        // Either no email OR all social links are null
        const businesses = await Business.find({
            $or: [
                { email: null },
                { email: { $exists: false } },
                {
                    'socialLinks.facebook': null,
                    'socialLinks.twitter': null,
                    'socialLinks.linkedin': null,
                    'socialLinks.instagram': null,
                    'socialLinks.youtube': null
                }
            ],
            website: { $ne: 'N/A', $exists: true }
        });

        console.log(`📊 Found ${businesses.length} businesses to re-scrape\n`);

        if (businesses.length === 0) {
            console.log('✅ No businesses need re-scraping. All done!');
            process.exit(0);
        }

        let processed = 0;
        let updated = 0;
        let failed = 0;

        // Process in batches
        for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
            const batch = businesses.slice(i, i + BATCH_SIZE);
            console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(businesses.length / BATCH_SIZE)}...`);

            const results = await Promise.allSettled(
                batch.map(async (business) => {
                    try {
                        console.log(`  🔍 Scraping: ${business.name} (${business.website})`);

                        const contacts = await extractContacts(business.website);

                        // Only update if we found some contact information
                        if (contacts.email ||
                            contacts.socialLinks.facebook ||
                            contacts.socialLinks.twitter ||
                            contacts.socialLinks.linkedin ||
                            contacts.socialLinks.instagram ||
                            contacts.socialLinks.youtube) {

                            await Business.findByIdAndUpdate(business._id, {
                                email: contacts.email || business.email,
                                socialLinks: {
                                    facebook: contacts.socialLinks.facebook || business.socialLinks.facebook,
                                    twitter: contacts.socialLinks.twitter || business.socialLinks.twitter,
                                    linkedin: contacts.socialLinks.linkedin || business.socialLinks.linkedin,
                                    instagram: contacts.socialLinks.instagram || business.socialLinks.instagram,
                                    youtube: contacts.socialLinks.youtube || business.socialLinks.youtube
                                }
                            });

                            console.log(`  ✅ Updated: ${business.name}`);
                            if (contacts.email) console.log(`     📧 Email: ${contacts.email}`);
                            if (contacts.socialLinks.facebook) console.log(`     📘 Facebook found`);
                            if (contacts.socialLinks.twitter) console.log(`     🐦 Twitter found`);
                            if (contacts.socialLinks.linkedin) console.log(`     💼 LinkedIn found`);
                            if (contacts.socialLinks.instagram) console.log(`     📷 Instagram found`);
                            if (contacts.socialLinks.youtube) console.log(`     📺 YouTube found`);

                            return { success: true, business: business.name };
                        } else {
                            console.log(`  ⚠️  No contacts found for: ${business.name}`);
                            return { success: false, business: business.name, reason: 'No contacts found' };
                        }
                    } catch (error) {
                        console.error(`  ❌ Failed: ${business.name} - ${error.message}`);
                        return { success: false, business: business.name, error: error.message };
                    }
                })
            );

            // Count results
            results.forEach((result) => {
                processed++;
                if (result.status === 'fulfilled' && result.value.success) {
                    updated++;
                } else {
                    failed++;
                }
            });

            console.log(`\n📊 Progress: ${processed}/${businesses.length} processed`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 Migration Complete!\n');
        console.log(`📊 Summary:`);
        console.log(`   Total Businesses: ${businesses.length}`);
        console.log(`   ✅ Successfully Updated: ${updated}`);
        console.log(`   ❌ Failed/No Data: ${failed}`);
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    }
}

// Run the migration
rescrapeBusinesses();
