import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Fuse from 'fuse.js';
import { businessKeywords } from '../utils/suggestions';

const searchLocations = async (query) => {
    if (!query || query.length < 3) return [];

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

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

    const handleSubmit = async (e, refresh = false) => {
        if (e) e.preventDefault();

        if (!keyword || !location) {
            alert('Please enter both keyword and location');
            return;
        }

        setLoading(true);
        setShowKeywordSuggestions(false);
        setShowLocationSuggestions(false);

        try {
            const token = isSignedIn ? await getToken() : null;
            await onSearch(keyword, location, token, refresh);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 relative group">
            {/* Guest Overlay */}
            {!isSignedIn && (
                <div className="absolute inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center p-6 border border-slate-700/50 group-hover:bg-slate-950/20 transition-all duration-500">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 rounded-full mb-3 border border-slate-700 shadow-xl">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1">Login Required</h3>
                        <p className="text-slate-400 text-sm mb-4">Please sign in to start generating leads.</p>
                    </div>
                </div>
            )}

            <form onSubmit={(e) => handleSubmit(e)}>
                <div className={`flex flex-col lg:flex-row gap-3 ${!isSignedIn ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                    {/* Keyword Input */}
                    <div className="relative flex-1" ref={keywordInputRef}>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="keyword"
                            value={keyword}
                            disabled={!isSignedIn}
                            onChange={(e) => handleKeywordChange(e.target.value)}
                            onFocus={() => keyword.length > 0 && setShowKeywordSuggestions(true)}
                            placeholder="Business type (restaurants, gyms...)"
                            className="w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
                            autoComplete="off"
                        />
                        {keyword && isSignedIn && (
                            <button
                                type="button"
                                onClick={() => setKeyword('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        {showKeywordSuggestions && keywordSuggestions.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                                {keywordSuggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        onClick={() => selectKeywordSuggestion(suggestion)}
                                        className="px-4 py-2.5 hover:bg-slate-700 cursor-pointer text-slate-300 text-sm flex items-center gap-2 border-b border-slate-700/50 last:border-0"
                                    >
                                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Location Input */}
                    <div className="relative flex-1" ref={locationInputRef}>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            disabled={!isSignedIn}
                            onChange={(e) => handleLocationChange(e.target.value)}
                            onFocus={() => location.length >= 3 && setShowLocationSuggestions(true)}
                            placeholder="City, area, or zip code"
                            className="w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
                            autoComplete="off"
                        />
                        {isLoadingLocations && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                        {location && !isLoadingLocations && isSignedIn && (
                            <button
                                type="button"
                                onClick={() => setLocation('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        {showLocationSuggestions && locationSuggestionsState.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                                {locationSuggestionsState.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        onClick={() => selectLocationSuggestion(suggestion)}
                                        className="px-4 py-2.5 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0"
                                    >
                                        <div className="flex items-start gap-2">
                                            <svg className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white font-medium truncate">
                                                    {suggestion.city || suggestion.displayName?.split(',')[0]}
                                                </p>
                                                <p className="text-xs text-slate-400 truncate">
                                                    {suggestion.state}, {suggestion.country}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {/* Search Button */}
                        <button
                            type="submit"
                            disabled={loading || !isSignedIn}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {loading && !showLocationSuggestions ? (
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                            <span>Search</span>
                        </button>

                        {/* Force Refresh Button */}
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, true)}
                            disabled={loading || !isSignedIn}
                            title="Force refresh (ignore cache)"
                            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-all flex items-center justify-center"
                        >
                            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SearchForm;