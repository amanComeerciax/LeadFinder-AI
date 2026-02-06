import PostalCode from '../models/PostalCode.model.js';
import iso3166 from 'iso-3166-1';

const COUNTRY_NAMES = {
    'IN': 'India',
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'AE': 'United Arab Emirates',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'PK': 'Pakistan',
    'BD': 'Bangladesh',
    'LK': 'Sri Lanka',
    'NP': 'Nepal',
    'TH': 'Thailand',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'VN': 'Vietnam',
    'NZ': 'New Zealand',
    'ZA': 'South Africa',
    'KE': 'Kenya',
    'NG': 'Nigeria'
};

/**
 * Utility to escape regex characters to prevent crashes from names like "Area (City)"
 */
const escapeRegex = (string) => {
    return string ? string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&') : '';
};

/**
 * Get all unique countries from the postal codes database
 * Returns countries with their codes, names, and count of postal codes
 */
export const getCountries = async (req, res) => {
    try {
        // Since we have global data now (or will have), we can just get all distinct country codes
        // Getting counts for 2M+ records via aggregation might be slow, so let's optimize
        // But for now, aggregation gives us the count which is nice to have in UI
        const countries = await PostalCode.aggregate([
            {
                $group: {
                    _id: '$countryCode',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    code: '$_id',
                    name: { $literal: '' },
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { code: 1 }
            }
        ]);

        // Add country names using ISO-3166-1 library
        const countriesWithNames = countries.map(country => {
            const isoData = iso3166.whereAlpha2(country.code);
            return {
                ...country,
                name: isoData ? isoData.country : (COUNTRY_NAMES[country.code] || country.code)
            };
        });

        res.json({
            success: true,
            data: countriesWithNames
        });
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch countries',
            error: error.message
        });
    }
};

/**
 * Get all unique cities for a specific country
 * Groups by city and state, sorted alphabetically
 */
export const getCitiesByCountry = async (req, res) => {
    try {
        const { countryCode } = req.params;
        const { search } = req.query;

        if (!countryCode) {
            return res.status(400).json({
                success: false,
                message: 'Country code is required'
            });
        }

        const matchStage = {
            countryCode: countryCode.toUpperCase()
        };

        // Add search filter if provided
        if (search) {
            const safeSearch = escapeRegex(search);
            matchStage.$or = [
                { placeName: { $regex: safeSearch, $options: 'i' } },
                { adminName2: { $regex: safeSearch, $options: 'i' } }
            ];
        }

        // Create a unique key using city and state for true grouping
        const cities = await PostalCode.aggregate([
            {
                $match: matchStage
            },
            {
                $group: {
                    _id: {
                        // Group by adminName2 (District/County) if available and not empty, otherwise placeName
                        city: {
                            $cond: [
                                { $in: ["$countryCode", ["US", "CA", "GB", "AU"]] },
                                "$placeName",
                                {
                                    $cond: [
                                        {
                                            $and: [
                                                { $ne: ["$adminName2", ""] },
                                                { $ne: ["$adminName2", null] }
                                            ]
                                        },
                                        "$adminName2",
                                        "$placeName"
                                    ]
                                }
                            ]
                        },
                        state: '$adminName1'
                    },
                    count: { $sum: 1 },
                    stateCode: { $first: '$adminCode1' }
                }
            },
            {
                $match: {
                    '_id.city': { $ne: '', $exists: true }
                }
            },
            {
                $project: {
                    city: '$_id.city',
                    state: '$_id.state',
                    stateCode: 1,
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { city: 1 }
            },
            {
                $limit: 1000
            }
        ]);

        res.json({
            success: true,
            data: cities,
            count: cities.length
        });
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cities',
            error: error.message
        });
    }
};

/**
 * Get postal codes for a specific city in a country
 * Returns postal codes with location details
 */
export const getPostalCodesByCity = async (req, res) => {
    try {
        const { countryCode, city } = req.params;
        const { search, state, limit = 100 } = req.query;

        if (!countryCode || !city) {
            return res.status(400).json({
                success: false,
                message: 'Country code and city are required'
            });
        }

        const safeCity = escapeRegex(city);
        const matchStage = {
            countryCode: countryCode.toUpperCase(),
            $or: [
                { placeName: { $regex: `^${safeCity}$`, $options: 'i' } },
                { adminName2: { $regex: `^${safeCity}$`, $options: 'i' } },
                { adminName3: { $regex: `^${safeCity}$`, $options: 'i' } }
            ]
        };

        // If state is provided, strictly filter by it to avoid cross-state conflicts (e.g. Rajkot in Tonk vs Gujarat)
        if (state) {
            matchStage.adminName1 = { $regex: `^${escapeRegex(state)}$`, $options: 'i' };
        }

        // Add search filter for postal code
        if (search) {
            matchStage.postalCode = { $regex: escapeRegex(search), $options: 'i' };
        }

        const postalCodes = await PostalCode.find(matchStage)
            .select('postalCode placeName adminName1 adminCode1 adminName2 adminName3 latitude longitude')
            .sort({ postalCode: 1 })
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            data: postalCodes,
            count: postalCodes.length
        });
    } catch (error) {
        console.error('Error fetching postal codes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch postal codes',
            error: error.message
        });
    }
};

/**
 * Advanced search for postal codes with multiple filters
 * Supports country, state, city, and postal code search
 */
export const searchPostalCodes = async (req, res) => {
    try {
        const { countryCode, state, city, search, limit = 50 } = req.query;

        const matchStage = {};

        // Build filter
        if (countryCode) {
            matchStage.countryCode = countryCode.toUpperCase();
        }

        if (state) {
            matchStage.adminName1 = { $regex: escapeRegex(state), $options: 'i' };
        }

        if (city) {
            const safeCity = escapeRegex(city);
            matchStage.$or = [
                { placeName: { $regex: safeCity, $options: 'i' } },
                { adminName2: { $regex: safeCity, $options: 'i' } }
            ];
        }

        if (search) {
            const safeSearch = escapeRegex(search);
            matchStage.$or = [
                { postalCode: { $regex: safeSearch, $options: 'i' } },
                { placeName: { $regex: safeSearch, $options: 'i' } },
                { adminName1: { $regex: safeSearch, $options: 'i' } },
                { adminName2: { $regex: safeSearch, $options: 'i' } }
            ];
        }

        const postalCodes = await PostalCode.find(matchStage)
            .select('postalCode placeName adminName1 adminCode1 adminName2 adminName3 countryCode latitude longitude')
            .sort({ countryCode: 1, adminName1: 1, placeName: 1, postalCode: 1 })
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            data: postalCodes,
            count: postalCodes.length
        });
    } catch (error) {
        console.error('Error searching postal codes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search postal codes',
            error: error.message
        });
    }
};

/**
 * Get location details by postal code
 * Returns full location information for a specific postal code
 */
export const getLocationByPostalCode = async (req, res) => {
    try {
        const { countryCode, postalCode } = req.params;

        if (!countryCode || !postalCode) {
            return res.status(400).json({
                success: false,
                message: 'Country code and postal code are required'
            });
        }

        const location = await PostalCode.findOne({
            countryCode: countryCode.toUpperCase(),
            postalCode: postalCode
        }).lean();

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Postal code not found'
            });
        }

        res.json({
            success: true,
            data: location
        });
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch location',
            error: error.message
        });
    }
};
