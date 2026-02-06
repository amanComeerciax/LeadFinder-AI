const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get all available countries from the postal code database
 * @returns {Promise<Array>} Array of countries with code, name, and count
 */
export const getCountries = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/postal-codes/countries`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch countries');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching countries:', error);
        throw error;
    }
};

/**
 * Get cities for a specific country
 * @param {string} countryCode - 2-letter country code (e.g., 'IN', 'US')
 * @param {string} search - Optional search term to filter cities
 * @returns {Promise<Array>} Array of cities with name, state, and count
 */
export const getCitiesByCountry = async (countryCode, search = '') => {
    try {
        const url = new URL(`${API_BASE_URL}/api/postal-codes/cities/${countryCode}`);
        if (search) {
            url.searchParams.append('search', search);
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch cities');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching cities:', error);
        throw error;
    }
};

/**
 * Get postal codes for a specific city
 * @param {string} countryCode - 2-letter country code
 * @param {string} city - City name
 * @param {string} search - Optional search term to filter postal codes
 * @param {number} limit - Maximum number of results (default: 100)
 * @returns {Promise<Array>} Array of postal codes with location details
 */
export const getPostalCodesByCity = async (countryCode, city, search = '', limit = 100, state = '') => {
    try {
        const url = new URL(`${API_BASE_URL}/api/postal-codes/pincodes/${countryCode}/${encodeURIComponent(city)}`);
        if (search) {
            url.searchParams.append('search', search);
        }
        if (state) {
            url.searchParams.append('state', state);
        }
        url.searchParams.append('limit', limit);

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch postal codes');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching postal codes:', error);
        throw error;
    }
};

/**
 * Search postal codes with advanced filters
 * @param {Object} filters - Filter options
 * @param {string} filters.countryCode - Country code filter
 * @param {string} filters.state - State name filter
 * @param {string} filters.city - City name filter
 * @param {string} filters.search - General search term
 * @param {number} filters.limit - Maximum results
 * @returns {Promise<Array>} Array of matching postal codes
 */
export const searchPostalCodes = async (filters = {}) => {
    try {
        const url = new URL(`${API_BASE_URL}/api/postal-codes/search`);

        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                url.searchParams.append(key, value);
            }
        });

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to search postal codes');
        }

        return data.data;
    } catch (error) {
        console.error('Error searching postal codes:', error);
        throw error;
    }
};

/**
 * Get location details by postal code
 * @param {string} countryCode - 2-letter country code
 * @param {string} postalCode - Postal/zip code
 * @returns {Promise<Object>} Location details
 */
export const getLocationByPostalCode = async (countryCode, postalCode) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/postal-codes/location/${countryCode}/${postalCode}`
        );
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch location');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching location:', error);
        throw error;
    }
};
