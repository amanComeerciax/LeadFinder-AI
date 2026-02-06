import axios from 'axios';

/**
 * Fetch all pincodes for a given city in India
 * Uses api.postalpincode.in (Free, No Key required)
 */
export const getPincodesByCity = async (city) => {
    try {
        console.log(`[Pincode Service] Fetching pincodes for city: ${city}`);

        // The API works best with just the city name
        const cityName = city.split(',')[0].trim();

        const response = await axios.get(`https://api.postalpincode.in/postoffice/${encodeURIComponent(cityName)}`);

        console.log(`[Pincode Service] API Status for ${cityName}: ${response.data?.[0]?.Status}`);

        if (!response.data || response.data[0].Status !== 'Success') {
            console.warn(`[Pincode Service] No pincodes found for ${cityName}: ${response.data?.[0]?.Message || 'Unknown error'}`);
            return [];
        }

        const postOffices = response.data[0].PostOffice || [];

        // Extract unique pincodes
        const pincodes = [...new Set(postOffices.map(po => po.Pincode))];

        console.log(`[Pincode Service] Found ${pincodes.length} unique pincodes for ${cityName}`);

        return pincodes;
    } catch (error) {
        console.error(`[Pincode Service] Error fetching pincodes:`, error.message);
        return [];
    }
};

export default {
    getPincodesByCity
};
