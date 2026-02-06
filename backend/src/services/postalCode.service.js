import axios from 'axios';
import PostalCode from '../models/PostalCode.model.js';
import geonamesService from './geonames.service.js';

/**
 * Utility to escape regex characters
 */
const escapeRegex = (string) => {
    return string ? string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&') : '';
};

/**
 * Country code mappings for common country names
 * Used by Zippopotam API
 */
const COUNTRY_CODE_MAP = {
    'india': 'IN',
    'united states': 'US',
    'usa': 'US',
    'america': 'US',
    'united kingdom': 'GB',
    'uk': 'GB',
    'britain': 'GB',
    'canada': 'CA',
    'australia': 'AU',
    'germany': 'DE',
    'france': 'FR',
    'spain': 'ES',
    'italy': 'IT',
    'netherlands': 'NL',
    'belgium': 'BE',
    'switzerland': 'CH',
    'austria': 'AT',
    'poland': 'PL',
    'sweden': 'SE',
    'norway': 'NO',
    'denmark': 'DK',
    'finland': 'FI',
    'portugal': 'PT',
    'greece': 'GR',
    'ireland': 'IE',
    'czech republic': 'CZ',
    'hungary': 'HU',
    'romania': 'RO',
    'bulgaria': 'BG',
    'croatia': 'HR',
    'slovakia': 'SK',
    'slovenia': 'SI',
    'lithuania': 'LT',
    'latvia': 'LV',
    'estonia': 'EE',
    'new zealand': 'NZ',
    'south africa': 'ZA',
    'mexico': 'MX',
    'brazil': 'BR',
    'argentina': 'AR',
    'chile': 'CL',
    'colombia': 'CO',
    'peru': 'PE',
    'uruguay': 'UY',
    'venezuela': 'VE',
};

/**
 * State/region abbreviations for Zippopotam API
 * Required for some countries that need state info
 */
const STATE_ABBREV_MAP = {
    // India
    'delhi': 'DL',
    'new delhi': 'DL',
    'maharashtra': 'MH',
    'mumbai': 'MH',
    'karnataka': 'KA',
    'bangalore': 'KA',
    'bengaluru': 'KA',
    'tamil nadu': 'TN',
    'chennai': 'TN',
    'west bengal': 'WB',
    'kolkata': 'WB',
    'telangana': 'TG',
    'hyderabad': 'TG',
    'gujarat': 'GJ',
    'ahmedabad': 'GJ',
    'rajasthan': 'RJ',
    'jaipur': 'RJ',
    'punjab': 'PB',
    'haryana': 'HR',
    'uttarakhand': 'UK',
    'uttar pradesh': 'UP',
    'madhya pradesh': 'MP',
    'bihar': 'BR',
    'odisha': 'OR',
    'assam': 'AS',
    'kerala': 'KL',
    'goa': 'GA',

    // USA
    'alabama': 'AL',
    'alaska': 'AK',
    'arizona': 'AZ',
    'arkansas': 'AR',
    'california': 'CA',
    'colorado': 'CO',
    'connecticut': 'CT',
    'delaware': 'DE',
    'florida': 'FL',
    'georgia': 'GA',
    'hawaii': 'HI',
    'idaho': 'ID',
    'illinois': 'IL',
    'indiana': 'IN',
    'iowa': 'IA',
    'kansas': 'KS',
    'kentucky': 'KY',
    'louisiana': 'LA',
    'maine': 'ME',
    'maryland': 'MD',
    'massachusetts': 'MA',
    'michigan': 'MI',
    'minnesota': 'MN',
    'mississippi': 'MS',
    'missouri': 'MO',
    'montana': 'MT',
    'nebraska': 'NE',
    'nevada': 'NV',
    'new hampshire': 'NH',
    'new jersey': 'NJ',
    'new mexico': 'NM',
    'new york': 'NY',
    'north carolina': 'NC',
    'north dakota': 'ND',
    'ohio': 'OH',
    'oklahoma': 'OK',
    'oregon': 'OR',
    'pennsylvania': 'PA',
    'rhode island': 'RI',
    'south carolina': 'SC',
    'south dakota': 'SD',
    'tennessee': 'TN',
    'texas': 'TX',
    'utah': 'UT',
    'vermont': 'VT',
    'virginia': 'VA',
    'washington': 'WA',
    'west virginia': 'WV',
    'wisconsin': 'WI',
    'wyoming': 'WY',
};

/**
 * Major US and Indian cities to state mapping for automatic detection
 * This enables postal code search even when user doesn't specify state
 */
const CITY_STATE_MAP = {
    // Major US Cities
    'new york': 'NY',
    'manhattan': 'NY',
    'brooklyn': 'NY',
    'queens': 'NY',
    'bronx': 'NY',
    'los angeles': 'CA',
    'san francisco': 'CA',
    'san diego': 'CA',
    'san jose': 'CA',
    'chicago': 'IL',
    'houston': 'TX',
    'dallas': 'TX',
    'austin': 'TX',
    'san antonio': 'TX',
    'phoenix': 'AZ',
    'philadelphia': 'PA',
    'boston': 'MA',
    'seattle': 'WA',
    'denver': 'CO',
    'miami': 'FL',
    'orlando': 'FL',
    'tampa': 'FL',
    'atlanta': 'GA',
    'las vegas': 'NV',
    'detroit': 'MI',
    'minneapolis': 'MN',
    'portland': 'OR',
    'nashville': 'TN',
    'baltimore': 'MD',
    'milwaukee': 'WI',
    'charlotte': 'NC',
    'indianapolis': 'IN',
    'columbus': 'OH',
    'cleveland': 'OH',
    'cincinnati': 'OH',
    'kansas city': 'MO',
    'st louis': 'MO',
    'salt lake city': 'UT',
    'new orleans': 'LA',
    'pittsburgh': 'PA',
    'sacramento': 'CA',
    'oakland': 'CA',
    'raleigh': 'NC',
    'memphis': 'TN',
    'oklahoma city': 'OK',
    'louisville': 'KY',

    // Major Indian Cities
    'mumbai': 'MH',
    'pune': 'MH',
    'nagpur': 'MH',
    'thane': 'MH',
    'nashik': 'MH',
    'delhi': 'DL',
    'new delhi': 'DL',
    'bangalore': 'KA',
    'bengaluru': 'KA',
    'mysore': 'KA',
    'mangalore': 'KA',
    'hubli': 'KA',
    'chennai': 'TN',
    'coimbatore': 'TN',
    'madurai': 'TN',
    'salem': 'TN',
    'tiruchirappalli': 'TN',
    'kolkata': 'WB',
    'howrah': 'WB',
    'durgapur': 'WB',
    'hyderabad': 'TG',
    'warangal': 'TG',
    'ahmedabad': 'GJ',
    'bapunagar': 'GJ',
    'surat': 'GJ',
    'vadodara': 'GJ',
    'rajkot': 'GJ',
    'bhavnagar': 'GJ',
    'jamnagar': 'GJ',
    'jaipur': 'RJ',
    'jodhpur': 'RJ',
    'kota': 'RJ',
    'udaipur': 'RJ',
    'chandigarh': 'PB',
    'ludhiana': 'PB',
    'amritsar': 'PB',
    'jalandhar': 'PB',
    'gurgaon': 'HR',
    'gurugram': 'HR',
    'faridabad': 'HR',
    'lucknow': 'UP',
    'kanpur': 'UP',
    'agra': 'UP',
    'varanasi': 'UP',
    'noida': 'UP',
    'ghaziabad': 'UP',
    'patna': 'BR',
    'bhubaneswar': 'OR',
    'indore': 'MP',
    'bhopal': 'MP',
    'guwahati': 'AS',
    'kochi': 'KL',
    'thiruvananthapuram': 'KL',
    'kozhikode': 'KL',
    'panaji': 'GA',
};

/**
 * City aliases for Zippopotam API
 * Maps localities/suburbs to their main city names recognized by the API
 */
const CITY_ALIAS_MAP = {
    // India Localities -> Main Cities
    'bapunagar': 'ahmedabad',
    'vastrapur': 'ahmedabad',
    'satellite': 'ahmedabad',
    'chandkheda': 'ahmedabad',
    'prahlad nagar': 'ahmedabad',
    'maninagar': 'ahmedabad',
    'andheri': 'mumbai',
    'bandra': 'mumbai',
    'borivali': 'mumbai',
    'juhu': 'mumbai',
    'worli': 'mumbai',
    'colaba': 'mumbai',
    'powsai': 'mumbai',
    'kormangala': 'bangalore',
    'indiranagar': 'bangalore',
    'whitefield': 'bangalore',
    'jayanagar': 'bangalore',
    'hsn layout': 'bangalore',
    'marathahalli': 'bangalore',
    'gurgaon': 'gurgaon',
    'noida': 'noida',
    'dwarka': 'delhi',
    'rohini': 'delhi',
    'saket': 'delhi',
    'vasant vihar': 'delhi',
    'pitampura': 'delhi',

    // US Neighborhoods -> Main Cities
    'manhattan': 'new york',
    'brooklyn': 'new york',
    'queens': 'new york',
    'bronx': 'new york',
    'staten island': 'new york',
    'hollywood': 'los angeles',
    'santa monica': 'los angeles',
    'beverly hills': 'los angeles',
};

/**
 * Detect country code from location string
 * @param {string} location - Location string (e.g., "Delhi, India" or "Boston, MA")
 * @returns {string|null} - Country code (e.g., "IN", "US") or null
 */
export const detectCountryCode = (location) => {
    if (!location) return null;

    const locationLower = location.toLowerCase().trim();

    // Check for explicit country name in location
    for (const [country, code] of Object.entries(COUNTRY_CODE_MAP)) {
        if (locationLower.includes(country)) {
            return code;
        }
    }

    // Default to India if no country detected (for backward compatibility)
    return 'IN';
};

/**
 * Parse location to extract city, state, and country
 * @param {string} location - Location string
 * @returns {object} - { city, state, country }
 */
export const parseLocation = (location) => {
    if (!location) return { city: null, state: null, country: null };

    const parts = location.split(',').map(p => p.trim());

    let city = parts[0];
    let state = null;
    let country = null;

    if (parts.length >= 2) {
        // Could be "City, State" or "City, Country"
        const secondPart = parts[1].toLowerCase();

        // Check if second part is a state abbreviation or name
        if (STATE_ABBREV_MAP[secondPart]) {
            state = STATE_ABBREV_MAP[secondPart];
        } else if (secondPart.length === 2) {
            // Assume it's already a state abbreviation
            state = secondPart.toUpperCase();
        }

        // Check if it's a country
        if (COUNTRY_CODE_MAP[secondPart]) {
            country = COUNTRY_CODE_MAP[secondPart];
        }
    }

    if (parts.length >= 3) {
        // "City, State, Country"
        const thirdPart = parts[2].toLowerCase();
        if (COUNTRY_CODE_MAP[thirdPart]) {
            country = COUNTRY_CODE_MAP[thirdPart];
        }
    }

    // Auto-detect state from city name if not explicitly provided
    if (!state && city) {
        const cityLower = city.toLowerCase();
        if (CITY_STATE_MAP[cityLower]) {
            state = CITY_STATE_MAP[cityLower];
            console.log(`[Postal Code Service] Auto-detected state: ${state} for city: ${city}`);
        }
    }

    return { city, state, country };
};

/**
 * Get postal codes for a city using Zippopotam API
 * @param {string} location - Location string
 * @returns {Promise<Array>} - Array of postal codes
 */
export const getPostalCodesByLocation = async (location) => {
    try {
        console.log(`[Postal Code Service] Fetching postal codes for: ${location}`);

        // Parse location first to get city and state
        const { city, state, country: parsedCountry } = parseLocation(location);
        if (!city) {
            console.warn(`[Postal Code Service] Could not extract city from: ${location}`);
            return [];
        }

        // Determine country code
        let countryCode = detectCountryCode(location);

        // If state is detected but no country was explicitly mentioned, infer from state
        if (state && !parsedCountry) {
            // Check if this is a US state (only check against US state codes)
            const usStateCodes = [
                'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GE', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
            ];
            if (usStateCodes.includes(state)) {
                countryCode = 'US';
                console.log(`[Postal Code Service] Inferred US from state: ${state}`);
            } else {
                // Default to India for other codes (like GJ, MH, KA, etc.)
                countryCode = 'IN';
                console.log(`[Postal Code Service] Inferred IN from state: ${state}`);
            }
        }

        // Use explicitly parsed country if available
        if (parsedCountry) {
            countryCode = parsedCountry;
        }

        if (!countryCode) {
            console.warn(`[Postal Code Service] Could not detect country for: ${location}`);
            return [];
        }

        console.log(`[Postal Code Service] Detected country: ${countryCode}, city: ${city}, state: ${state}`);

        // --- STEP 1: Try Local Database (GeoNames Data) ---
        try {
            const query = { countryCode: countryCode.toUpperCase() };

            // For State: Check both code (MH) and name (Maharashtra)
            if (state) {
                const stateCodesToNames = {
                    'MH': 'Maharashtra', 'DL': 'Delhi', 'KA': 'Karnataka', 'TN': 'Tamil Nadu',
                    'WB': 'West Bengal', 'TG': 'Telangana', 'GJ': 'Gujarat', 'RJ': 'Rajasthan',
                    'PB': 'Punjab', 'HR': 'Haryana', 'UP': 'Uttar Pradesh', 'MP': 'Madhya Pradesh',
                    'BR': 'Bihar', 'OR': 'Odisha', 'AS': 'Assam', 'KL': 'Kerala', 'GA': 'Goa',
                    'NY': 'New York', 'CA': 'California', 'TX': 'Texas', 'FL': 'Florida',
                    'IL': 'Illinois', 'PA': 'Pennsylvania', 'OH': 'Ohio', 'GA': 'Georgia',
                    'NC': 'North Carolina', 'MI': 'Michigan', 'NJ': 'New Jersey', 'VA': 'Virginia',
                    'WA': 'Washington', 'AZ': 'Arizona', 'MA': 'Massachusetts', 'TN': 'Tennessee',
                    'IN': 'Indiana', 'MO': 'Missouri', 'MD': 'Maryland', 'WI': 'Wisconsin',
                    'CO': 'Colorado', 'MN': 'Minnesota', 'SC': 'South Carolina', 'AL': 'Alabama',
                    'LA': 'Louisiana', 'KY': 'Kentucky', 'OR': 'Oregon', 'OK': 'Oklahoma'
                };

                const stateName = stateCodesToNames[state.toUpperCase()] || state;
                const safeStateName = escapeRegex(stateName);
                const safeState = escapeRegex(state);
                query.$or = [
                    { adminName1: new RegExp(`${safeStateName}`, 'i') },
                    { adminCode1: new RegExp(`^${safeState}$`, 'i') }
                ];
            }

            // For City: Be more flexible (match within placeName, adminName2, or adminName3)
            if (city) {
                const safeCity = escapeRegex(city);
                const cityRegex = new RegExp(`${safeCity}`, 'i');
                const cityMatch = {
                    $or: [
                        { placeName: cityRegex },
                        { adminName2: cityRegex },
                        { adminName3: cityRegex }
                    ]
                };

                // Combine with existing $or if state was provided
                if (query.$or) {
                    query.$and = [
                        { $or: query.$or },
                        cityMatch
                    ];
                    delete query.$or;
                } else {
                    Object.assign(query, cityMatch);
                }
            }

            console.log(`[Postal Code Service] Querying local DB: ${JSON.stringify(query)}`);
            const localResults = await PostalCode.find(query).distinct('postalCode');
            if (localResults.length > 0) {
                console.log(`[Postal Code Service] Found ${localResults.length} postal codes in local DB for ${location}`);
                return localResults;
            }

            console.log(`[Postal Code Service] No local data found for ${location}. Falling back to APIs...`);

            // Background check: If we have NO data for this country AT ALL, maybe trigger an ingestion?
            const countryExists = await PostalCode.exists({ countryCode: countryCode.toUpperCase() });
            if (!countryExists && ['IN', 'US'].includes(countryCode.toUpperCase())) {
                console.log(`[Postal Code Service] Triggering background ingestion for ${countryCode}...`);
                geonamesService.downloadAndIngestCountry(countryCode).catch(err =>
                    console.error(`[Postal Code Service] Background ingestion failed for ${countryCode}:`, err.message)
                );
            }
        } catch (dbError) {
            console.error(`[Postal Code Service] Local DB lookup failed:`, dbError.message);
        }

        // --- STEP 2: Fallback to External APIs ---
        let apiUrl;
        const cityLower = city.toLowerCase();
        const cityForApi = CITY_ALIAS_MAP[cityLower] || cityLower;
        const cityFormatted = cityForApi.replace(/\s+/g, '%20');

        // Build API URL based on country and state availability
        if (state && (countryCode === 'US' || countryCode === 'IN')) {
            // For US and India, try with state first
            apiUrl = `http://api.zippopotam.us/${countryCode.toLowerCase()}/${state.toLowerCase()}/${cityFormatted}`;
        } else {
            // For other countries or when state is not available, search by city name is not supported
            // Zippopotam API primarily works with postal codes directly
            console.warn(`[Postal Code Service] Zippopotam API requires state for ${countryCode}. Falling back to standard search.`);
            return [];
        }

        console.log(`[Postal Code Service] API URL: ${apiUrl}`);

        const response = await axios.get(apiUrl, {
            timeout: 5000,
            headers: {
                'User-Agent': 'BusinessScraper/1.0'
            }
        });

        if (!response.data || !response.data.places) {
            console.warn(`[Postal Code Service] No postal codes found for ${location}`);
            return [];
        }

        // Extract unique postal codes from response
        const postalCodes = [...new Set(
            response.data.places.map(place => place['post code'])
        )].filter(Boolean);

        console.log(`[Postal Code Service] Found ${postalCodes.length} postal codes for ${location}`);

        return postalCodes;
    } catch (error) {
        if (error.response?.status === 404) {
            console.warn(`[Postal Code Service] No postal codes found for ${location} (404)`);
        } else {
            console.error(`[Postal Code Service] Error fetching postal codes:`, error.message);
        }
        return [];
    }
};

/**
 * Batch postal codes into groups
 * @param {Array} postalCodes - Array of postal codes
 * @param {number} batchSize - Size of each batch
 * @returns {Array<Array>} - Array of batches
 */
export const batchPostalCodes = (postalCodes, batchSize = 10) => {
    const batches = [];
    for (let i = 0; i < postalCodes.length; i += batchSize) {
        batches.push(postalCodes.slice(i, i + batchSize));
    }
    return batches;
};

/**
 * Check if postal code search is supported for a location
 * @param {string} location - Location string
 * @returns {boolean} - True if supported
 */
export const isPostalCodeSearchSupported = (location) => {
    const countryCode = detectCountryCode(location);
    const { state, city } = parseLocation(location);

    console.log(`[Postal Code Debug] Location: "${location}", Detected Country: ${countryCode}, Extracted City: ${city}, Extracted State: ${state}`);

    // If we have countryCode and city, we can try to find postal codes in our database
    // This now supports all countries because we ingested the global dataset
    const isSupported = !!(countryCode && city);
    console.log(`[Postal Code Debug] Is Supported: ${isSupported}`);

    return isSupported;
};

// For backward compatibility
export const getPincodesByCity = async (city) => {
    return getPostalCodesByLocation(`${city}, India`);
};

export default {
    getPostalCodesByLocation,
    detectCountryCode,
    parseLocation,
    batchPostalCodes,
    isPostalCodeSearchSupported,
    getPincodesByCity, // backward compatibility
};
