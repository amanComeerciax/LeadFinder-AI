import express from 'express';
import {
    getCountries,
    getCitiesByCountry,
    getPostalCodesByCity,
    searchPostalCodes,
    getLocationByPostalCode
} from '../controllers/postalCode.controller.js';

const router = express.Router();

// Get all countries
router.get('/countries', getCountries);

// Get cities by country
router.get('/cities/:countryCode', getCitiesByCountry);

// Get postal codes by city
router.get('/pincodes/:countryCode/:city', getPostalCodesByCity);

// Search postal codes with filters
router.get('/search', searchPostalCodes);

// Get location details by postal code
router.get('/location/:countryCode/:postalCode', getLocationByPostalCode);

export default router;
