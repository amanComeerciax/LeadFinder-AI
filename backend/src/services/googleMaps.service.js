import axios from 'axios';

const searchBusinesses = async (keyword, location) => {
    try {
        let allBusinesses = [];
        let nextStart = 0;
        let hasMore = true;
        const processLimit = 3; // Fetch up to 3 pages (approx 60 results)
        let pageCount = 0;

        while (hasMore && pageCount < processLimit) {
            console.log(`Fetching page ${pageCount + 1}...`);

            const response = await axios.get('https://serpapi.com/search', {
                params: {
                    engine: 'google_maps',
                    q: `${keyword} ${location}`,
                    type: 'search',
                    api_key: process.env.SERPAPI_KEY,
                    start: nextStart,
                },
            });

            if (response.data.error) {
                console.error(`SerpAPI Error on page ${pageCount + 1}: ${response.data.error}`);
                break; // Stop if error, return what we have
            }

            const localResults = response.data.local_results || [];
            if (localResults.length === 0) {
                hasMore = false;
                break;
            }

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
                googleMapsUrl: place.place_id ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}` : (place.gps_coordinates ? `https://www.google.com/maps/search/?api=1&query=${place.gps_coordinates.latitude},${place.gps_coordinates.longitude}` : null),
            }));

            allBusinesses = [...allBusinesses, ...pageBusinesses];

            // Check for next page
            if (response.data.serpapi_pagination?.next) {
                // Parse 'start' param from next link or increment manually
                // SerpAPI usually handles this via 'start' parameter (0, 20, 40...)
                nextStart += 20;
                pageCount++;
            } else {
                hasMore = false;
            }
        }

        console.log(`Total businesses fetched: ${allBusinesses.length}`);
        return allBusinesses;
    } catch (error) {
        throw new Error(`Failed to fetch businesses: ${error.message}`);
    }
};

export { searchBusinesses };
