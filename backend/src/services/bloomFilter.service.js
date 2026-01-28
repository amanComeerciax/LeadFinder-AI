import pkg from 'bloom-filters';
const { BloomFilter } = pkg;
import { connection } from '../config/queue.js'; // reusing redis connection

class BloomFilterService {
    constructor() {
        // Create a Bloom Filter backed by optimal size for ~100k items
        // Size = 2,000,000 bits (approx 250KB), Hashes = 7
        this.urlFilter = new BloomFilter(2000000, 7);
        this.placeIdFilter = new BloomFilter(2000000, 7);
        this.redis = connection;
        this.isLoaded = false;
    }

    async init() {
        if (this.isLoaded) return;

        try {
            // Try to load from Redis
            const urlFilterData = await this.redis.get('bloom:url_filter');
            const placeIdFilterData = await this.redis.get('bloom:place_id_filter');

            if (urlFilterData) {
                const parsedUrl = JSON.parse(urlFilterData);
                this.urlFilter = BloomFilter.fromJSON(parsedUrl);
            }

            if (placeIdFilterData) {
                const parsedPlaceId = JSON.parse(placeIdFilterData);
                this.placeIdFilter = BloomFilter.fromJSON(parsedPlaceId);
            }

            this.isLoaded = true;
            console.log('✅ Bloom Filters loaded from Redis');
        } catch (error) {
            console.error('❌ Failed to load Bloom Filters:', error);
            // Continue with empty filters if load fails
            this.isLoaded = true;
        }
    }

    async save() {
        try {
            await this.redis.set('bloom:url_filter', JSON.stringify(this.urlFilter.saveAsJSON()));
            await this.redis.set('bloom:place_id_filter', JSON.stringify(this.placeIdFilter.saveAsJSON()));
        } catch (error) {
            console.error('❌ Failed to save Bloom Filters:', error);
        }
    }

    async shouldCrawl(url) {
        await this.init();
        if (!url || url === 'N/A') return false;

        // Normalizing URL for check
        // Remove protocol and trailing slash for consistent checking
        const normalizedUrl = url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '').toLowerCase();

        if (this.urlFilter.has(normalizedUrl)) {
            return false; // Skip crawling
        }
        return true; // Should crawl
    }

    async addCrawled(url) {
        await this.init();
        if (!url || url === 'N/A') return;

        const normalizedUrl = url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '').toLowerCase();
        this.urlFilter.add(normalizedUrl);
        // Save periodically or after add (debouncing could be improved here but simple save is fine for now)
        await this.save();
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
}

export const bloomFilterService = new BloomFilterService();
