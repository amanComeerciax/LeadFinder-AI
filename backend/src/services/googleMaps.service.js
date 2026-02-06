import axios from 'axios';

/**
 * Search businesses using Google Places API Text Search
 * Official API - more reliable than SerpAPI scraping
 */
const searchBusinesses = async (keyword, location) => {
    try {
        let allBusinesses = [];
        let nextPageToken = null;
        const processLimit = 3; // Fetch up to 3 pages (60 results max)
        let pageCount = 0;

        while (pageCount < processLimit) {
            console.log(`Fetching page ${pageCount + 1}...`);

            // Build API URL
            const params = {
                query: `${keyword} in ${location}`,
                key: process.env.GOOGLE_MAPS_API_KEY,
            };

            // Add pagetoken for pagination (starts from page 2)
            if (nextPageToken) {
                params.pagetoken = nextPageToken;
                // Google requires 2-second delay before using next page token
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            const response = await axios.get(
                'https://maps.googleapis.com/maps/api/place/textsearch/json',
                { params }
            );

            if (response.data.status === 'ZERO_RESULTS') {
                console.log('No results found');
                break;
            }

            if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
                const errorMsg = `Google Places API Error: ${response.data.status} - ${response.data.error_message || ''}`;
                console.error(errorMsg);
                throw new Error(errorMsg); // Throw error to trigger SerpAPI fallback
            }

            const results = response.data.results || [];

            if (results.length === 0) {
                break;
            }

            // Map Google Places data to our business schema
            const pageBusinesses = results.map((place) => ({
                name: place.name || 'N/A',
                address: place.formatted_address || 'N/A',
                phone: 'N/A', // Will fetch from Place Details if needed
                website: 'N/A', // Will fetch from Place Details if needed
                rating: place.rating || 0,
                totalReviews: place.user_ratings_total || 0,
                location,
                keyword,
                latitude: place.geometry?.location?.lat || null,
                longitude: place.geometry?.location?.lng || null,
                place_id: place.place_id || null,
                googleMapsUrl: place.place_id
                    ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
                    : null,
                // Photo support (Google Places Photos API)
                photoUrl: place.photos?.[0]?.photo_reference
                    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
                    : null,
                category: place.types?.[0]?.replace(/_/g, ' ') || keyword,
                hours: place.opening_hours?.open_now !== undefined
                    ? (place.opening_hours.open_now ? 'Open now' : 'Closed')
                    : null,
                openingHours: place.opening_hours || null,
            }));

            allBusinesses = [...allBusinesses, ...pageBusinesses];

            // Check for next page
            nextPageToken = response.data.next_page_token;
            if (!nextPageToken) {
                break; // No more pages
            }

            pageCount++;
        }

        console.log(`Total businesses fetched: ${allBusinesses.length}`);

        // Enrich all businesses with phone & website using Place Details API
        console.log(`Enriching ${allBusinesses.length} businesses with details...`);

        for (let i = 0; i < allBusinesses.length; i++) {
            const business = allBusinesses[i];
            if (business.place_id) {
                try {
                    const details = await getPlaceDetails(business.place_id);
                    allBusinesses[i].phone = details.phone || 'N/A';
                    allBusinesses[i].website = details.website || 'N/A';

                    // Add delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (err) {
                    console.warn(`Failed to enrich ${business.name}: ${err.message}`);
                }
            }
        }

        return allBusinesses;
    } catch (error) {
        // Fallback to SerpAPI if Google Places API fails (e.g., Billing issues)
        console.warn(`Google Places API failed: ${error.message}. Attempting fallback to SerpAPI...`);
        try {
            return await searchBusinessesSerp(keyword, location);
        } catch (serpError) {
            throw new Error(`Both Google Places and SerpAPI failed. SerpAPI error: ${serpError.message}`);
        }
    }
};

/**
 * Fetch Place Details (Phone, Website)
 * @param {string} placeId - Google Place ID
 * @returns {Object} - { phone, website }
 */
const getPlaceDetails = async (placeId) => {
    try {
        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/place/details/json',
            {
                params: {
                    place_id: placeId,
                    fields: 'formatted_phone_number,international_phone_number,website',
                    key: process.env.GOOGLE_MAPS_API_KEY,
                },
            }
        );

        const result = response.data.result;
        if (!result) return { phone: null, website: null };

        return {
            phone: result.formatted_phone_number || result.international_phone_number || null,
            website: result.website || null,
        };
    } catch (error) {
        return { phone: null, website: null };
    }
};

/**
 * Search businesses using postal codes (for Phase 1 - fast collection)
 * @param {string} keyword - Business keyword
 * @param {Array} postalCodes - Array of postal codes to search
 * @param {string} location - Original location string
 * @param {boolean} light - If true, skip Place Details API (faster)
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Array} - All unique businesses found
 */
const searchBusinessesWithPostalCodes = async (keyword, postalCodes, location, light = true, progressCallback = null) => {
    try {
        console.log(`[Postal Search] Starting search for "${keyword}" across ${postalCodes.length} postal codes`);

        const allBusinesses = [];
        const seenPlaceIds = new Set();
        let processedCount = 0;

        // Process postal codes in batches to avoid rate limiting
        const BATCH_SIZE = 5;
        const DELAY_BETWEEN_REQUESTS = 500; // 500ms delay

        for (let i = 0; i < postalCodes.length; i += BATCH_SIZE) {
            const batch = postalCodes.slice(i, i + BATCH_SIZE);
            console.log(`[Postal Search] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(postalCodes.length / BATCH_SIZE)}`);

            // Process batch in parallel
            const batchResults = await Promise.all(
                batch.map(async (postalCode) => {
                    try {
                        let postalResults = [];
                        let nextPageToken = null;
                        const pageLimit = 3; // Fetch up to 3 pages (60 results)
                        let pageCount = 0;

                        while (pageCount < pageLimit) {
                            // Add delay before each request (Google requirement for next_page_token)
                            if (pageCount > 0 || processedCount > 0) {
                                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
                            }

                            const query = `${keyword} ${postalCode}`;
                            const params = {
                                query,
                                key: process.env.GOOGLE_MAPS_API_KEY,
                            };

                            if (nextPageToken) {
                                params.pagetoken = nextPageToken;
                                // Next page token needs a bit more delay usually
                                await new Promise(resolve => setTimeout(resolve, 2000));
                            }

                            console.log(`[Postal Search] Searching: ${query}${nextPageToken ? ' (Next Page)' : ''}`);

                            const response = await axios.get(
                                'https://maps.googleapis.com/maps/api/place/textsearch/json',
                                { params, timeout: 15000 }
                            );

                            if (response.data.status === 'ZERO_RESULTS') {
                                if (pageCount === 0) console.log(`[Postal Search] No results for ${postalCode}`);
                                break;
                            }

                            if (response.data.status !== 'OK') {
                                console.warn(`[Postal Search] API error for ${postalCode}: ${response.data.status}`);
                                if (response.data.status === 'REQUEST_DENIED') {
                                    throw new Error(`Google API billing error: ${response.data.status}`);
                                }
                                break;
                            }

                            const results = response.data.results || [];
                            postalResults = [...postalResults, ...results];

                            nextPageToken = response.data.next_page_token;
                            if (!nextPageToken) break;

                            pageCount++;
                        }

                        console.log(`[Postal Search] Found ${postalResults.length} total results for ${postalCode}`);
                        return postalResults;
                    } catch (error) {
                        console.error(`[Postal Search] Error searching ${postalCode}:`, error.message);
                        // Re-throw billing errors to trigger fallback
                        if (error.message.includes('billing') || error.message.includes('REQUEST_DENIED')) {
                            throw error;
                        }
                        return [];
                    }
                })
            );

            // Flatten and process results
            const flatResults = batchResults.flat();

            for (const place of flatResults) {
                // Skip duplicates based on place_id
                if (!place.place_id || seenPlaceIds.has(place.place_id)) {
                    continue;
                }

                seenPlaceIds.add(place.place_id);

                // Map to our business schema (light mode - minimal data)
                const business = {
                    name: place.name || 'N/A',
                    address: place.formatted_address || 'N/A',
                    phone: light ? 'N/A' : (place.formatted_phone_number || 'N/A'),
                    website: light ? 'N/A' : (place.website || 'N/A'),
                    rating: place.rating || 0,
                    totalReviews: place.user_ratings_total || 0,
                    location,
                    keyword,
                    latitude: place.geometry?.location?.lat || null,
                    longitude: place.geometry?.location?.lng || null,
                    place_id: place.place_id || null,
                    googleMapsUrl: place.place_id
                        ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
                        : null,
                    photoUrl: place.photos?.[0]?.photo_reference
                        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
                        : null,
                    category: place.types?.[0]?.replace(/_/g, ' ') || keyword,
                    hours: place.opening_hours?.open_now !== undefined
                        ? (place.opening_hours.open_now ? 'Open now' : 'Closed')
                        : null,
                    openingHours: place.opening_hours || null,
                };

                allBusinesses.push(business);
            }

            processedCount += batch.length;

            // Progress callback
            if (progressCallback) {
                const progress = Math.floor((processedCount / postalCodes.length) * 100);
                const shouldCancel = await progressCallback({
                    processed: processedCount,
                    total: postalCodes.length,
                    found: allBusinesses.length,
                    progress,
                });

                if (shouldCancel === true) {
                    console.log(`[Postal Search] Search cancelled for job at progress: ${progress}%`);
                    return allBusinesses;
                }
            }
        }

        console.log(`[Postal Search] Completed. Found ${allBusinesses.length} unique businesses across ${postalCodes.length} postal codes`);

        // If not in light mode, enrich with Place Details
        if (!light && allBusinesses.length > 0) {
            console.log(`[Postal Search] Enriching ${allBusinesses.length} businesses with details...`);

            for (let i = 0; i < allBusinesses.length; i++) {
                const business = allBusinesses[i];
                if (business.place_id) {
                    try {
                        const details = await getPlaceDetails(business.place_id);
                        allBusinesses[i].phone = details.phone || 'N/A';
                        allBusinesses[i].website = details.website || 'N/A';
                    } catch (error) {
                        console.error(`Failed to fetch details for ${business.name}: ${error.message}`);
                    }
                }

                if (progressCallback && i % 10 === 0) {
                    const shouldCancel = await progressCallback({
                        enriched: i,
                        total: allBusinesses.length,
                        message: 'Enriching with contact details...',
                    });

                    if (shouldCancel === true) {
                        console.log(`[Postal Search] Enrichment cancelled for job`);
                        return allBusinesses;
                    }
                }
            }
        }

        return allBusinesses;
    } catch (error) {
        console.error('[Postal Search] Fatal error:', error.message);

        // Fallback to SerpAPI for postal code search
        if (error.message.includes('billing') || error.message.includes('REQUEST_DENIED')) {
            console.warn('[Postal Search] Google API failed due to billing. Falling back to SerpAPI with simplified search...');
            try {
                // SerpAPI doesn't support multiple postal codes well, so search by location only
                return await searchBusinessesSerp(keyword, location);
            } catch (serpError) {
                throw new Error(`Both Google Places and SerpAPI failed. SerpAPI error: ${serpError.message}`);
            }
        }

        throw error;
    }
};

/**
 * Search businesses using SerpAPI (Fallback)
 */
const searchBusinessesSerp = async (keyword, location) => {
    try {
        console.log(`[SerpAPI] Searching for "${keyword}" in "${location}"`);
        let allBusinesses = [];
        const processLimit = 3; // Max 3 pages (60 results)
        let pageCount = 0;
        let nextStart = 0; // SerpAPI uses 'start' parameter (0, 20, 40...)

        while (pageCount < processLimit) {
            console.log(`[SerpAPI] Fetching page ${pageCount + 1}...`);

            const response = await axios.get('https://serpapi.com/search', {
                params: {
                    engine: 'google_maps',
                    q: `${keyword} in ${location}`,
                    type: 'search',
                    start: nextStart,
                    api_key: process.env.SERPAPI_KEY,
                },
            });

            if (response.data.error) {
                throw new Error(`SerpAPI Error: ${response.data.error}`);
            }

            const results = response.data.local_results || [];

            if (results.length === 0) {
                break;
            }

            // Map SerpAPI results to our schema
            const pageBusinesses = results.map((place) => ({
                name: place.title || 'N/A',
                address: place.address || 'N/A',
                phone: place.phone || 'N/A',
                website: place.website || 'N/A',
                rating: place.rating || 0,
                totalReviews: place.reviews || 0,
                location,
                keyword,
                latitude: place.gps_coordinates?.latitude || null,
                longitude: place.gps_coordinates?.longitude || null,
                place_id: place.place_id || `${place.title}_${place.address}`, // Fallback ID
                googleMapsUrl: place.place_id
                    ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
                    : null,
                photoUrl: place.thumbnail || null,
                category: place.type || keyword,
                hours: place.operating_hours ? JSON.stringify(place.operating_hours) : null,
                openingHours: place.operating_hours || null,
            }));

            allBusinesses = [...allBusinesses, ...pageBusinesses];

            // Check for next page
            if (!response.data.serpapi_pagination?.next) {
                break;
            }

            // Setup next page
            nextStart += 20;
            pageCount++;

            // Delay for rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`[SerpAPI] Total businesses fetched: ${allBusinesses.length}`);
        return allBusinesses;

    } catch (error) {
        console.error(`[SerpAPI] Search failed: ${error.message}`);
        throw error;
    }
};

/**
 * Enhanced searchBusinesses with light mode support
 * @param {string} keyword - Business keyword
 * @param {string} location - Location string
 * @param {boolean} light - If true, skip Place Details API (faster)
 * @returns {Array} - Businesses found
 */
const searchBusinessesLight = async (keyword, location, light = false) => {
    const businesses = await searchBusinesses(keyword, location);

    // If light mode, skip the enrichment step (it's already in searchBusinesses)
    // This is mainly for backward compatibility
    return businesses;
};

export { searchBusinesses, searchBusinessesWithPostalCodes, searchBusinessesLight, getPlaceDetails };
