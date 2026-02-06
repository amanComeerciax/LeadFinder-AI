import { useState, useEffect, useRef } from 'react';
import {
    getCountries,
    getCitiesByCountry,
    getPostalCodesByCity
} from '../api/postalCode.api';

const LocationFilter = ({ onLocationSelect, initialLocation = null }) => {
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [postalCodes, setPostalCodes] = useState([]);

    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedPostalCode, setSelectedPostalCode] = useState(null);

    const [countrySearch, setCountrySearch] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [postalCodeSearch, setPostalCodeSearch] = useState('');

    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showPostalCodeDropdown, setShowPostalCodeDropdown] = useState(false);

    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingPostalCodes, setLoadingPostalCodes] = useState(false);

    const countryRef = useRef(null);
    const cityRef = useRef(null);
    const postalCodeRef = useRef(null);
    const citySearchTimeout = useRef(null);
    const postalCodeSearchTimeout = useRef(null);

    // Load countries on mount
    useEffect(() => {
        loadCountries();
    }, []);

    // Handle clicks outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (countryRef.current && !countryRef.current.contains(event.target)) {
                setShowCountryDropdown(false);
            }
            if (cityRef.current && !cityRef.current.contains(event.target)) {
                setShowCityDropdown(false);
            }
            if (postalCodeRef.current && !postalCodeRef.current.contains(event.target)) {
                setShowPostalCodeDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load cities when country changes
    useEffect(() => {
        if (selectedCountry) {
            loadCities(selectedCountry.code);
        } else {
            setCities([]);
            setSelectedCity(null);
            setSelectedPostalCode(null);
        }
    }, [selectedCountry]);

    // Load postal codes when city changes
    useEffect(() => {
        if (selectedCity && selectedCountry) {
            loadPostalCodes(selectedCountry.code, selectedCity.city);
        } else {
            setPostalCodes([]);
            setSelectedPostalCode(null);
        }
    }, [selectedCity, selectedCountry]);

    // Notify parent when postal code is selected
    useEffect(() => {
        if (selectedPostalCode && selectedCity && selectedCountry) {
            let formatted;
            if (selectedPostalCode.postalCode === 'ALL') {
                // Formatting for whole city search
                formatted = `${selectedCity.city}, ${selectedCity.state || ''}, ${selectedCountry.name}`.replace(/,\s*,/g, ',').trim();
            } else {
                // Formatting for specific pincode - USE DATA FROM PINCODE RECORD AS MUCH AS POSSIBLE
                // This prevents "Rajkot, Tonk, Gujarat" if user picked wrong city
                const district = selectedPostalCode.adminName2 || selectedPostalCode.adminName3 || '';
                const state = selectedPostalCode.adminName1 || selectedCity.state || '';
                const place = selectedPostalCode.placeName || selectedCity.city;

                formatted = `${place}, ${district ? district + ', ' : ''}${state}, ${selectedPostalCode.postalCode}`.replace(/,\s*,/g, ',').trim();
            }

            onLocationSelect({
                country: selectedCountry,
                city: selectedCity,
                postalCode: selectedPostalCode,
                formatted: formatted
            });
        } else if (!selectedPostalCode && !selectedCity && !selectedCountry) {
            // Clear location when all are deselected
            onLocationSelect(null);
        }
    }, [selectedPostalCode, selectedCity, selectedCountry]);

    const loadCountries = async () => {
        setLoadingCountries(true);
        try {
            const data = await getCountries();
            setCountries(data);
        } catch (error) {
            console.error('Failed to load countries:', error);
        } finally {
            setLoadingCountries(false);
        }
    };

    const loadCities = async (countryCode, search = '') => {
        setLoadingCities(true);
        try {
            const data = await getCitiesByCountry(countryCode, search);
            setCities(data);
        } catch (error) {
            console.error('Failed to load cities:', error);
            setCities([]);
        } finally {
            setLoadingCities(false);
        }
    };


    const loadPostalCodes = async (countryCode, city, search = '') => {
        setLoadingPostalCodes(true);
        try {
            // Pass state to avoid cross-state conflicts (e.g. Rajkot in Tonk vs Gujarat)
            const data = await getPostalCodesByCity(countryCode, city, search, 100, selectedCity?.state);
            setPostalCodes(data);
        } catch (error) {
            console.error('Failed to load postal codes:', error);
            setPostalCodes([]);
        } finally {
            setLoadingPostalCodes(false);
        }
    };

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setCountrySearch(country.name);
        setShowCountryDropdown(false);
        setCitySearch('');
        setPostalCodeSearch('');
    };

    const handleCitySelect = (city) => {
        setSelectedCity(city);
        setCitySearch(city.city);
        setShowCityDropdown(false);
        setPostalCodeSearch('');
        // Automatically open the postal code dropdown when a city is selected
        setShowPostalCodeDropdown(true);
    };

    const handlePostalCodeSelect = (postalCode) => {
        setSelectedPostalCode(postalCode);
        setPostalCodeSearch(postalCode.postalCode === 'ALL' ? `All in ${selectedCity.city}` : postalCode.postalCode);
        setShowPostalCodeDropdown(false);
    };

    const handleCitySearchChange = (value) => {
        setCitySearch(value);

        if (citySearchTimeout.current) {
            clearTimeout(citySearchTimeout.current);
        }

        if (selectedCountry && value.length >= 2) {
            citySearchTimeout.current = setTimeout(() => {
                loadCities(selectedCountry.code, value);
            }, 300);
        }
    };

    const handlePostalCodeSearchChange = (value) => {
        setPostalCodeSearch(value);

        if (postalCodeSearchTimeout.current) {
            clearTimeout(postalCodeSearchTimeout.current);
        }

        if (selectedCountry && selectedCity && value.length >= 2) {
            postalCodeSearchTimeout.current = setTimeout(() => {
                loadPostalCodes(selectedCountry.code, selectedCity.city, value);
            }, 300);
        }
    };

    const handleClearAll = () => {
        setSelectedCountry(null);
        setSelectedCity(null);
        setSelectedPostalCode(null);
        setCountrySearch('');
        setCitySearch('');
        setPostalCodeSearch('');
        setCities([]);
        setPostalCodes([]);
        onLocationSelect(null);
    };

    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        country.code.toLowerCase().includes(countrySearch.toLowerCase())
    );

    return (
        <div className="w-full space-y-3">
            {/* Three Column Grid - Desktop, Stack on Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Country Dropdown */}
                <div className="relative" ref={countryRef}>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Country
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            onFocus={() => setShowCountryDropdown(true)}
                            placeholder="Select country"
                            className="w-full px-3 py-2.5 text-sm bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            autoComplete="off"
                        />
                        {selectedCountry && (
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {showCountryDropdown && filteredCountries.length > 0 && (
                        <div className="absolute z-[999] left-0 right-0 mt-1.5 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                            {filteredCountries.map((country) => (
                                <div
                                    key={country.code}
                                    onClick={() => handleCountrySelect(country)}
                                    className={`px-3 py-2.5 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0 transition-colors ${selectedCountry?.code === country.code ? 'bg-slate-700' : ''}`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm text-white font-medium">{country.name}</span>
                                        <span className="text-xs text-slate-400">{country.count?.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* City Dropdown */}
                <div className="relative" ref={cityRef}>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        City
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={citySearch}
                            onChange={(e) => handleCitySearchChange(e.target.value)}
                            onFocus={() => selectedCountry && setShowCityDropdown(true)}
                            placeholder={selectedCountry ? "Select city" : "Select country first"}
                            disabled={!selectedCountry}
                            className="w-full px-3 py-2.5 text-sm bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            autoComplete="off"
                        />
                        {loadingCities && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                <svg className="animate-spin h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                    </div>

                    {showCityDropdown && cities.length > 0 && !loadingCities && (
                        <div className="absolute z-[999] left-0 right-0 mt-1.5 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                            {cities.map((city, index) => (
                                <div
                                    key={`${city.city}-${index}`}
                                    onClick={() => handleCitySelect(city)}
                                    className={`px-3 py-2.5 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0 transition-colors ${selectedCity?.city === city.city ? 'bg-slate-700' : ''}`}
                                >
                                    <p className="text-sm text-white font-medium">{city.city}</p>
                                    {city.state && <p className="text-xs text-slate-400 mt-0.5">{city.state}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Postal Code Dropdown */}
                <div className="relative" ref={postalCodeRef}>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Postal Code
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={postalCodeSearch}
                            onChange={(e) => handlePostalCodeSearchChange(e.target.value)}
                            onFocus={() => selectedCity && setShowPostalCodeDropdown(true)}
                            placeholder={selectedCity ? "Select code" : "Select city first"}
                            disabled={!selectedCity}
                            className="w-full px-3 py-2.5 text-sm bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            autoComplete="off"
                        />
                        {loadingPostalCodes && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                <svg className="animate-spin h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                    </div>

                    {showPostalCodeDropdown && postalCodes.length > 0 && !loadingPostalCodes && (
                        <div className="absolute z-[999] left-0 right-0 mt-1.5 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                            {/* All in City Option */}
                            <div
                                onClick={() => handlePostalCodeSelect({ postalCode: 'ALL', placeName: `All in ${selectedCity.city}` })}
                                className="px-3 py-3 hover:bg-blue-600/20 cursor-pointer border-b border-slate-700/50 transition-colors group"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-400 font-bold">Search All in {selectedCity.city}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Thorough scan • Best results</p>
                                    </div>
                                </div>
                            </div>

                            {postalCodes.map((postalCode, index) => (
                                <div
                                    key={`${postalCode.postalCode}-${index}`}
                                    onClick={() => handlePostalCodeSelect(postalCode)}
                                    className={`px-3 py-2.5 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0 transition-colors ${selectedPostalCode?.postalCode === postalCode.postalCode ? 'bg-slate-700' : ''}`}
                                >
                                    <p className="text-sm text-white font-medium">{postalCode.postalCode}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {postalCode.placeName}
                                        {postalCode.adminName2 && postalCode.adminName2 !== postalCode.placeName ? `, ${postalCode.adminName2}` : ''}
                                        {/* Fallback to adminName3 if adminName2 is missing or same */}
                                        {!postalCode.adminName2 && postalCode.adminName3 && postalCode.adminName3 !== postalCode.placeName ? `, ${postalCode.adminName3}` : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Location Badge */}
            {selectedCountry && selectedCity && selectedPostalCode && (
                <div className="flex items-center gap-2 p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-blue-100 flex-1 truncate">
                        {selectedPostalCode.postalCode === 'ALL'
                            ? `Full Search: ${selectedCity.city}, ${selectedCity.state || selectedCountry.name}`
                            : `${selectedCity.city}, ${selectedPostalCode.adminName2 || selectedPostalCode.adminName3 || selectedCity.state || selectedCountry.name} • ${selectedPostalCode.postalCode}`
                        }
                    </span>
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="flex-shrink-0 text-xs text-blue-300 hover:text-white px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
};

export default LocationFilter;
