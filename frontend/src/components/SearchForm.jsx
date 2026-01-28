import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Fuse from 'fuse.js';
import { businessKeywords } from '../utils/suggestions';

const searchLocations = async (query) => {
    if (!query || query.length < 3) return [];

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in,us,uk,ae,sg,ca,au`,
            {
                headers: {
                    'User-Agent': 'BusinessScraper/1.0',
                    'Accept-Language': 'en-US,en;q=0.9'
                },
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Nominatim API error');
        }

        const data = await response.json();

        return data.map(item => ({
            displayName: item.display_name,
            city: item.address?.city || item.address?.town || item.address?.village || item.address?.suburb || '',
            state: item.address?.state || item.address?.county || '',
            country: item.address?.country || '',
            postcode: item.address?.postcode || 'N/A',
            lat: item.lat,
            lon: item.lon,
        }));
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('Location search timeout');
        } else {
            console.error('Location search error:', error);
        }
        return [];
    }
};

const SearchForm = ({ onSearch, initialKeyword = '', initialLocation = '' }) => {
    const { getToken, isSignedIn } = useAuth();
    const [keyword, setKeyword] = useState(initialKeyword);
    const [location, setLocation] = useState(initialLocation);
    const [loading, setLoading] = useState(false);
    const [keywordSuggestions, setKeywordSuggestions] = useState([]);
    const [locationSuggestionsState, setLocationSuggestionsState] = useState([]);
    const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);
    const keywordInputRef = useRef(null);
    const locationInputRef = useRef(null);
    const locationSearchTimeout = useRef(null);

    useEffect(() => {
        setKeyword(initialKeyword);
        setLocation(initialLocation);
    }, [initialKeyword, initialLocation]);

    const keywordFuse = new Fuse(businessKeywords, {
        threshold: 0.4,
        distance: 100,
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (keywordInputRef.current && !keywordInputRef.current.contains(event.target)) {
                setShowKeywordSuggestions(false);
            }
            if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
                setShowLocationSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeywordChange = (value) => {
        setKeyword(value);
        if (value.length > 0) {
            const results = keywordFuse.search(value).map((result) => result.item);
            setKeywordSuggestions(results.slice(0, 5));
            setShowKeywordSuggestions(true);
        } else {
            setKeywordSuggestions([]);
            setShowKeywordSuggestions(false);
        }
    };

    const handleLocationChange = async (value) => {
        setLocation(value);

        if (locationSearchTimeout.current) {
            clearTimeout(locationSearchTimeout.current);
        }

        if (value.length >= 3) {
            setIsLoadingLocations(true);

            locationSearchTimeout.current = setTimeout(async () => {
                const results = await searchLocations(value);
                setLocationSuggestionsState(results);
                setShowLocationSuggestions(true);
                setIsLoadingLocations(false);
            }, 500);
        } else {
            setLocationSuggestionsState([]);
            setShowLocationSuggestions(false);
            setIsLoadingLocations(false);
        }
    };

    const selectKeywordSuggestion = (suggestion) => {
        setKeyword(suggestion);
        setShowKeywordSuggestions(false);
    };

    const selectLocationSuggestion = (suggestion) => {
        const locationText = suggestion.city && suggestion.state
            ? `${suggestion.city}, ${suggestion.state}`
            : suggestion.displayName.split(',').slice(0, 2).join(',');

        setLocation(locationText);
        setShowLocationSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!keyword || !location) {
            alert('Please enter both keyword and location');
            return;
        }
        setLoading(true);
        setShowKeywordSuggestions(false);
        setShowLocationSuggestions(false);
        const token = isSignedIn ? await getToken() : null;
        await onSearch(keyword, location, token);
        setLoading(false);
    };

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-900/20 shadow-2xl border border-purple-200 dark:border-purple-500/30 p-8 mb-8">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDE2NywgMTM5LCAyNTAsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30 dark:opacity-20 pointer-events-none"></div>

            <div className="relative flex items-center gap-4 mb-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-xl opacity-50"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                        Search Businesses
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Find leads with AI-powered search</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="relative space-y-6">
                <div className="relative" ref={keywordInputRef}>
                    <label htmlFor="keyword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        What are you looking for?
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            id="keyword"
                            value={keyword}
                            onChange={(e) => handleKeywordChange(e.target.value)}
                            onFocus={() => keyword.length > 0 && setShowKeywordSuggestions(true)}
                            placeholder="e.g., restaurants, hotels, cafes"
                            className="w-full px-5 py-4 pl-14 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-700 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm group-hover:shadow-md"
                            autoComplete="off"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                    {showKeywordSuggestions && keywordSuggestions.length > 0 && (
                        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {keywordSuggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    onClick={() => selectKeywordSuggestion(suggestion)}
                                    className="px-5 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-700 dark:text-gray-300 transition-all flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                >
                                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span className="font-medium">{suggestion}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative" ref={locationInputRef}>
                    <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        Where?
                        {isLoadingLocations && (
                            <svg className="animate-spin h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => handleLocationChange(e.target.value)}
                            onFocus={() => location.length >= 3 && setShowLocationSuggestions(true)}
                            placeholder="Type any location (city, area, zipcode...)"
                            className="w-full px-5 py-4 pl-14 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-700 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm group-hover:shadow-md"
                            autoComplete="off"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>
                    {showLocationSuggestions && locationSuggestionsState.length > 0 && (
                        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-80 overflow-y-auto">
                            {locationSuggestionsState.map((suggestion, index) => (
                                <div
                                    key={index}
                                    onClick={() => selectLocationSuggestion(suggestion)}
                                    className="px-5 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-all border-b border-gray-100 dark:border-gray-700 last:border-0"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                            <div className="flex-1 min-w-0">
                                                {suggestion.city && (
                                                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                                                        {suggestion.city}{suggestion.state && `, ${suggestion.state}`}
                                                    </div>
                                                )}
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                                                    {suggestion.displayName}
                                                </div>
                                            </div>
                                        </div>
                                        {suggestion.postcode !== 'N/A' && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-md flex-shrink-0">
                                                <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                <span className="text-xs font-mono font-semibold text-purple-700 dark:text-purple-300">
                                                    {suggestion.postcode}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {showLocationSuggestions && locationSuggestionsState.length === 0 && !isLoadingLocations && location.length >= 3 && (
                        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No locations found. Try a different search.
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-100 group-hover:opacity-90 transition-opacity rounded-xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-lg"></div>
                    <div className="relative px-6 py-4 text-white font-semibold text-lg shadow-xl flex items-center justify-center gap-3">
                        {loading ? (
                            <>
                                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Searching...
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search Businesses
                            </>
                        )}
                    </div>
                </button>
            </form>
        </div>
    );
};

export default SearchForm;
