import pkg from 'bloom-filters';
const { BloomFilter } = pkg;
import { connection } from '../config/queue.js'; // reusing redis connection

class BloomFilterService {
    constructor() {
        // Create a Bloom Filter backed by optimal size for ~100k items
        // Size = 2,000,000 bits (approx 250KB), Hashes = 7
        this.placeIdFilter = new BloomFilter(2000000, 7);
        this.redis = connection;
        this.isLoaded = false;
    }

    async init() {
        if (this.isLoaded) return;

        try {
            // Try to load from Redis
            const placeIdFilterData = await this.redis.get('bloom:place_id_filter');

            if (placeIdFilterData) {
                const parsedPlaceId = JSON.parse(placeIdFilterData);
                this.placeIdFilter = BloomFilter.fromJSON(parsedPlaceId);
            }

            this.isLoaded = true;
            console.log('✅ Bloom Filter loaded from Redis');
        } catch (error) {
            console.error('❌ Failed to load Bloom Filter:', error);
            // Continue with empty filter if load fails
            this.isLoaded = true;
        }
    }

    async save() {
        try {
            await this.redis.set('bloom:place_id_filter', JSON.stringify(this.placeIdFilter.saveAsJSON()));
        } catch (error) {
            console.error('❌ Failed to save Bloom Filter:', error);
        }
    }

    async shouldProcess(placeId) {
        await this.init();
        if (!placeId) return true; // Always process if no ID

        if (this.placeIdFilter.has(placeId)) {
            return false; // Skip processing
        }
        return true; // Should process
    }

    async addProcessed(placeId) {
        await this.init();
        if (!placeId) return;

        this.placeIdFilter.add(placeId);
        await this.save();
    }

    /**
     * Atomic check-and-add operation to prevent race conditions
     * Checks if a place_id exists and adds it if not in one operation
     * @param {string} placeId - The place_id to check and add
     * @returns {Promise<boolean>} - true if should process (new), false if duplicate
     */
    async checkAndAdd(placeId) {
        await this.init();

        // Always process if no ID
        if (!placeId) return true;

        // Check if already exists
        const exists = this.placeIdFilter.has(placeId);

        if (exists) {
            return false; // Skip - already processed
        }

        // Add to filter and save atomically
        this.placeIdFilter.add(placeId);
        await this.save();

        return true; // Should process - newly added
    }

    /**
     * Batch check multiple place_ids at once for better performance
     * @param {string[]} placeIds - Array of place_ids to check
     * @returns {Promise<boolean[]>} - Array of booleans indicating which should be processed
     */
    async batchCheckAndAdd(placeIds) {
        await this.init();

        const results = [];
        let hasChanges = false;

        for (const placeId of placeIds) {
            if (!placeId) {
                results.push(true);
                continue;
            }

            const exists = this.placeIdFilter.has(placeId);

            if (exists) {
                results.push(false);
            } else {
                this.placeIdFilter.add(placeId);
                results.push(true);
                hasChanges = true;
            }
        }

        // Save once after all additions
        if (hasChanges) {
            await this.save();
        }

        return results;
    }
}

export const bloomFilterService = new BloomFilterService();
