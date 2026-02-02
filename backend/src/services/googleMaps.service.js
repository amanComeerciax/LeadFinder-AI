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
                console.error(`Google Places API Error: ${response.data.status} - ${response.data.error_message || ''}`);
                break;
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
                } catch (error) {
                    // Continue if details fetch fails
                    console.error(`Failed to fetch details for ${business.name}: ${error.message}`);
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
 * Fallback search using SerpAPI
 */
const searchBusinessesSerp = async (keyword, location) => {
    try {
        let allBusinesses = [];
        let nextStart = 0;
        let hasMore = true;
        const processLimit = 3;
        let pageCount = 0;

        while (hasMore && pageCount < processLimit) {
            const response = await axios.get('https://serpapi.com/search', {
                params: {
                    engine: 'google_maps',
                    q: `${keyword} ${location}`,
                    type: 'search',
                    api_key: process.env.SERPAPI_KEY,
                    start: nextStart,
                },
            });

            if (response.data.error) break;

            const localResults = response.data.local_results || [];
            if (localResults.length === 0) break;

            const pageBusinesses = localResults.map((place) => ({
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
                place_id: place.place_id || null,
                googleMapsUrl: place.place_id ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}` : null,
                photoUrl: place.thumbnail || null,
                category: place.type || keyword,
                hours: place.hours || null,
                openingHours: place.operating_hours || null,
            }));

            allBusinesses = [...allBusinesses, ...pageBusinesses];

            if (response.data.serpapi_pagination?.next) {
                nextStart += 20;
                pageCount++;
            } else {
                hasMore = false;
            }
        }
        return allBusinesses;
    } catch (error) {
        throw new Error(`SerpAPI search failed: ${error.message}`);
    }
};

/**
 * Get detailed information for a specific place using Place Details API
 * @param {string} placeId - Google Place ID
 * @returns {Object} - Place details with phone and website
 */
const getPlaceDetails = async (placeId) => {
    try {
        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/place/details/json',
            {
                params: {
                    place_id: placeId,
                    fields: 'formatted_phone_number,website,international_phone_number',
                    key: process.env.GOOGLE_MAPS_API_KEY,
                }
            }
        );

        if (response.data.status !== 'OK') {
            return { phone: null, website: null };
        }

        const result = response.data.result;
        return {
            phone: result.formatted_phone_number || result.international_phone_number || null,
            website: result.website || null,
        };
    } catch (error) {
        return { phone: null, website: null };
    }
};

export { searchBusinesses, getPlaceDetails };
