import { searchBusinesses } from './googleMaps.service.js';

/**
 * GRID-BASED SEARCH FOR UNLIMITED RESULTS
 * Breaks down large cities into smaller areas to bypass 60-result limit
 */

/**
 * Smart grid search - automatically divides city into neighborhoods
 * @param {string} keyword - Business type (e.g., "Restaurants")
 * @param {string} city - City name (e.g., "New York")
 * @param {Array} neighborhoods - Optional neighborhood list
 * @param {Object} options - Search options
 * @returns {Array} All businesses found across all grids
 */
export const gridSearchBusinesses = async (keyword, city, neighborhoods = [], options = {}) => {
    const {
        maxResultsPerGrid = 60,
        enableAutoNeighborhoods = true,
        deduplicateResults = true
    } = options;

    let allResults = [];
    let searchAreas = neighborhoods;

    // If no neighborhoods provided, use auto-detection
    if (searchAreas.length === 0 && enableAutoNeighborhoods) {
        searchAreas = await detectNeighborhoods(city);
    }

    // Fallback to single search if no areas found
    if (searchAreas.length === 0) {
        console.log('[Grid Search] No neighborhoods found, falling back to single search');
        return await searchBusinesses(keyword, city);
    }

    console.log(`[Grid Search] Searching ${searchAreas.length} areas in ${city}`);

    // Search each area
    for (let i = 0; i < searchAreas.length; i++) {
        const area = searchAreas[i];
        const fullLocation = `${area}, ${city}`;

        try {
            console.log(`[Grid Search] [${i + 1}/${searchAreas.length}] Searching: ${fullLocation}`);

            const results = await searchBusinesses(keyword, fullLocation);
            allResults = [...allResults, ...results];

            console.log(`[Grid Search] Found ${results.length} results in ${area}`);

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`[Grid Search] Failed to search ${area}:`, error.message);
            continue;
        }
    }

    // Deduplicate by place_id
    if (deduplicateResults) {
        const uniqueMap = new Map();
        allResults.forEach(business => {
            if (business.place_id && !uniqueMap.has(business.place_id)) {
                uniqueMap.set(business.place_id, business);
            }
        });
        allResults = Array.from(uniqueMap.values());
        console.log(`[Grid Search] Total unique results: ${allResults.length}`);
    }

    return allResults;
};

/**
 * Auto-detect neighborhoods/areas within a city
 * Uses common area suffixes and patterns
 */
const detectNeighborhoods = async (city) => {
    // Pre-defined neighborhoods for major cities
    const cityNeighborhoods = {
        // USA
        'New York': ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
        'Los Angeles': ['Downtown LA', 'Hollywood', 'Santa Monica', 'Beverly Hills', 'Venice'],
        'Chicago': ['Downtown Chicago', 'North Side', 'South Side', 'West Side'],
        'Houston': ['Downtown Houston', 'Midtown', 'Montrose', 'The Heights'],
        'Miami': ['Miami Beach', 'Downtown Miami', 'Coral Gables', 'Brickell'],

        // India
        'Mumbai': ['Andheri', 'Bandra', 'Colaba', 'Powai', 'Worli', 'Juhu', 'Malad'],
        'Delhi': ['Connaught Place', 'Karol Bagh', 'Saket', 'Dwarka', 'Rohini'],
        'Bangalore': ['Koramangala', 'Indiranagar', 'Whitefield', 'MG Road', 'HSR Layout'],
        'Hyderabad': ['Hitech City', 'Banjara Hills', 'Jubilee Hills', 'Secunderabad'],
        'Pune': ['Koregaon Park', 'Hinjewadi', 'Viman Nagar', 'Kothrud'],

        // UK
        'London': ['Westminster', 'Camden', 'Greenwich', 'Kensington', 'Soho'],

        // Canada
        'Toronto': ['Downtown Toronto', 'North York', 'Scarborough', 'Etobicoke'],

        // Australia
        'Sydney': ['CBD', 'Bondi', 'Parramatta', 'Manly', 'Surry Hills']
    };

    // Check if city is in our database
    const normalized = city.trim();

    for (const [cityName, areas] of Object.entries(cityNeighborhoods)) {
        if (normalized.toLowerCase().includes(cityName.toLowerCase())) {
            console.log(`[Grid Search] Found ${areas.length} neighborhoods for ${cityName}`);
            return areas;
        }
    }

    // If not found, try generic area divisions
    console.log('[Grid Search] City not in database, using generic divisions');
    return [
        `North ${city}`,
        `South ${city}`,
        `East ${city}`,
        `West ${city}`,
        `Central ${city}`,
        `Downtown ${city}`
    ];
};

/**
 * Radius-based circular search
 * Divides area into overlapping circles for comprehensive coverage
 */
export const radiusSearchBusinesses = async (keyword, centerLat, centerLng, totalRadiusKm = 10) => {
    // Generate circle grid
    const circles = generateCircleGrid(centerLat, centerLng, totalRadiusKm);

    let allResults = [];

    console.log(`[Radius Search] Searching ${circles.length} circular areas`);

    for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];

        try {
            const results = await searchBusinesses(
                keyword,
                `${circle.lat}, ${circle.lng}`
            );

            allResults = [...allResults, ...results];

            console.log(`[Radius Search] Circle ${i + 1}: ${results.length} results`);

        } catch (error) {
            console.error(`[Radius Search] Circle ${i + 1} failed:`, error.message);
        }
    }

    // Deduplicate
    const unique = Array.from(
        new Map(allResults.map(b => [b.place_id, b])).values()
    );

    return unique;
};

/**
 * Generate overlapping circular grid
 * Math: divide area into circles with 80% overlap for full coverage
 */
const generateCircleGrid = (centerLat, centerLng, totalRadiusKm) => {
    const circles = [];
    const circleRadiusKm = 2; // Each circle covers 2km radius
    const overlapFactor = 0.8; // 80% overlap

    // Calculate number of circles needed
    const numCircles = Math.ceil(totalRadiusKm / (circleRadiusKm * (1 - overlapFactor)));

    // Generate circles in a spiral pattern
    circles.push({ lat: centerLat, lng: centerLng, radius: circleRadiusKm });

    for (let i = 1; i <= numCircles; i++) {
        const angle = (i * 60) % 360; // 60-degree increments
        const distance = i * circleRadiusKm * (1 - overlapFactor);

        // Calculate new position (rough approximation)
        // 1 degree lat ≈ 111km
        const newLat = centerLat + (distance / 111) * Math.sin(angle * Math.PI / 180);
        const newLng = centerLng + (distance / 111) * Math.cos(angle * Math.PI / 180);

        circles.push({ lat: newLat, lng: newLng, radius: circleRadiusKm });
    }

    return circles.slice(0, 20); // Limit to 20 circles for API quota
};

/**
 * Multi-keyword search for variety
 * Use different keyword variations to get more results
 */
export const multiKeywordSearch = async (baseKeyword, location) => {
    const variations = generateKeywordVariations(baseKeyword);

    let allResults = [];

    for (const keyword of variations) {
        console.log(`[Multi-Keyword] Searching: "${keyword}"`);
        const results = await searchBusinesses(keyword, location);
        allResults = [...allResults, ...results];
    }

    // Deduplicate
    const unique = Array.from(
        new Map(allResults.map(b => [b.place_id, b])).values()
    );

    console.log(`[Multi-Keyword] Found ${unique.length} unique businesses`);

    return unique;
};

/**
 * Generate keyword variations
 */
const generateKeywordVariations = (keyword) => {
    const prefixes = ['Best', 'Top', 'Popular', 'Local'];
    const suffixes = ['near me', 'in area', 'nearby'];

    const variations = [keyword]; // Original

    // Add prefix variations
    prefixes.forEach(prefix => {
        variations.push(`${prefix} ${keyword}`);
    });

    // Add suffix variations
    suffixes.forEach(suffix => {
        variations.push(`${keyword} ${suffix}`);
    });

    return variations.slice(0, 5); // Limit to 5 variations
};

export default {
    gridSearchBusinesses,
    radiusSearchBusinesses,
    multiKeywordSearch
};
