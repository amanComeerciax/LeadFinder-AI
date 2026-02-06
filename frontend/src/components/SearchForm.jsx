// import { useState, useEffect, useRef } from 'react';
// import { useAuth } from '@clerk/clerk-react';
// import Fuse from 'fuse.js';
// import { businessKeywords } from '../utils/suggestions';
// import LocationFilter from './LocationFilter';

// const searchLocations = async (query) => {
//     if (!query || query.length < 3) return [];

//     try {
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 5000);

//         const response = await fetch(
//             `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in,us,uk,ae,sg,ca,au`,
//             {
//                 headers: {
//                     'User-Agent': 'BusinessScraper/1.0',
//                     'Accept-Language': 'en-US,en;q=0.9'
//                 },
//                 signal: controller.signal
//             }
//         );

//         clearTimeout(timeoutId);

//         if (!response.ok) {
//             throw new Error('Nominatim API error');
//         }

//         const data = await response.json();

//         return data.map(item => ({
//             displayName: item.display_name,
//             city: item.address?.city || item.address?.town || item.address?.village || item.address?.suburb || '',
//             state: item.address?.state || item.address?.county || '',
//             country: item.address?.country || '',
//             postcode: item.address?.postcode || 'N/A',
//             lat: item.lat,
//             lon: item.lon,
//         }));
//     } catch (error) {
//         if (error.name === 'AbortError') {
//             console.warn('Location search timeout');
//         } else {
//             console.error('Location search error:', error);
//         }
//         return [];
//     }
// };

// const SearchForm = ({ onSearch, initialKeyword = '', initialLocation = '' }) => {
//     const { getToken, isSignedIn } = useAuth();
//     const [keyword, setKeyword] = useState(initialKeyword);
//     const [location, setLocation] = useState(initialLocation);
//     const [loading, setLoading] = useState(false);
//     const [keywordSuggestions, setKeywordSuggestions] = useState([]);
//     const [locationSuggestionsState, setLocationSuggestionsState] = useState([]);
//     const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
//     const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
//     const [isLoadingLocations, setIsLoadingLocations] = useState(false);

//     // New state for location mode toggle
//     const [locationMode, setLocationMode] = useState('filter'); // 'manual' or 'filter', default to filter
//     const [filterLocation, setFilterLocation] = useState(null);

//     const keywordInputRef = useRef(null);
//     const locationInputRef = useRef(null);
//     const locationSearchTimeout = useRef(null);

//     useEffect(() => {
//         setKeyword(initialKeyword);
//         setLocation(initialLocation);
//     }, [initialKeyword, initialLocation]);

//     const keywordFuse = new Fuse(businessKeywords, {
//         threshold: 0.4,
//         distance: 100,
//     });

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (keywordInputRef.current && !keywordInputRef.current.contains(event.target)) {
//                 setShowKeywordSuggestions(false);
//             }
//             if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
//                 setShowLocationSuggestions(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     const handleKeywordChange = (value) => {
//         setKeyword(value);
//         if (value.length > 0) {
//             const results = keywordFuse.search(value).map((result) => result.item);
//             setKeywordSuggestions(results.slice(0, 5));
//             setShowKeywordSuggestions(true);
//         } else {
//             setKeywordSuggestions([]);
//             setShowKeywordSuggestions(false);
//         }
//     };

//     const handleLocationChange = async (value) => {
//         setLocation(value);

//         if (locationSearchTimeout.current) {
//             clearTimeout(locationSearchTimeout.current);
//         }

//         if (value.length >= 3) {
//             setIsLoadingLocations(true);

//             locationSearchTimeout.current = setTimeout(async () => {
//                 const results = await searchLocations(value);
//                 setLocationSuggestionsState(results);
//                 setShowLocationSuggestions(true);
//                 setIsLoadingLocations(false);
//             }, 500);
//         } else {
//             setLocationSuggestionsState([]);
//             setShowLocationSuggestions(false);
//             setIsLoadingLocations(false);
//         }
//     };

//     const selectKeywordSuggestion = (suggestion) => {
//         setKeyword(suggestion);
//         setShowKeywordSuggestions(false);
//     };

//     const selectLocationSuggestion = (suggestion) => {
//         const locationText = suggestion.city && suggestion.state
//             ? `${suggestion.city}, ${suggestion.state}`
//             : suggestion.displayName.split(',').slice(0, 2).join(',');

//         setLocation(locationText);
//         setShowLocationSuggestions(false);
//     };

//     const handleSubmit = async (e, refresh = false) => {
//         if (e) e.preventDefault();

//         // Determine the location string based on mode
//         const locationString = locationMode === 'filter' && filterLocation
//             ? filterLocation.formatted
//             : location;

//         if (!keyword || !locationString) {
//             alert('Please enter both keyword and location');
//             return;
//         }

//         setLoading(true);
//         setShowKeywordSuggestions(false);
//         setShowLocationSuggestions(false);

//         try {
//             const token = isSignedIn ? await getToken() : null;
//             await onSearch(keyword, locationString, token, refresh);
//         } catch (error) {
//             console.error('Search error:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 relative group">
//             {/* Guest Overlay */}
//             {!isSignedIn && (
//                 <div className="absolute inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center p-6 border border-slate-700/50 group-hover:bg-slate-950/20 transition-all duration-500">
//                     <div className="text-center">
//                         <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 rounded-full mb-3 border border-slate-700 shadow-xl">
//                             <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                             </svg>
//                         </div>
//                         <h3 className="text-white font-bold text-lg mb-1">Login Required</h3>
//                         <p className="text-slate-400 text-sm mb-4">Please sign in to start generating leads.</p>
//                     </div>
//                 </div>
//             )}

//             <form onSubmit={(e) => handleSubmit(e)}>
//                 <div className={`bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 ${!isSignedIn ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
//                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//                         {/* Business Type - Takes 3 columns */}
//                         <div className="lg:col-span-3 relative" ref={keywordInputRef}>
//                             <label className="block text-sm font-semibold text-slate-300 mb-2">
//                                 Business Type
//                             </label>
//                             <div className="relative">
//                                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                                     </svg>
//                                 </div>
//                                 <input
//                                     type="text"
//                                     id="keyword"
//                                     value={keyword}
//                                     disabled={!isSignedIn}
//                                     onChange={(e) => handleKeywordChange(e.target.value)}
//                                     onFocus={() => keyword.length > 0 && setShowKeywordSuggestions(true)}
//                                     placeholder="e.g., restaurants, gyms"
//                                     className="w-full pl-12 pr-10 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
//                                     autoComplete="off"
//                                 />
//                                 {keyword && isSignedIn && (
//                                     <button
//                                         type="button"
//                                         onClick={() => setKeyword('')}
//                                         className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
//                                     >
//                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                         </svg>
//                                     </button>
//                                 )}
//                             </div>
//                             {showKeywordSuggestions && keywordSuggestions.length > 0 && (
//                                 <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
//                                     {keywordSuggestions.map((suggestion, index) => (
//                                         <div
//                                             key={index}
//                                             onClick={() => selectKeywordSuggestion(suggestion)}
//                                             className="px-4 py-3 hover:bg-slate-700 cursor-pointer text-slate-200 text-sm flex items-center gap-2 border-b border-slate-700/50 last:border-0 transition-colors"
//                                         >
//                                             <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                                             </svg>
//                                             {suggestion}
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Location Section - Takes 7 columns */}
//                         <div className="lg:col-span-7 relative">
//                             <div className="flex items-center justify-between mb-2">
//                                 <label className="text-sm font-semibold text-slate-300">
//                                     Location
//                                 </label>
//                                 <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-600/50 rounded-lg p-0.5">
//                                     <button
//                                         type="button"
//                                         onClick={() => setLocationMode('manual')}
//                                         disabled={!isSignedIn}
//                                         className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${locationMode === 'manual'
//                                             ? 'bg-blue-600 text-white shadow-sm'
//                                             : 'text-slate-400 hover:text-white'
//                                             }`}
//                                     >
//                                         Manual
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={() => setLocationMode('filter')}
//                                         disabled={!isSignedIn}
//                                         className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${locationMode === 'filter'
//                                             ? 'bg-blue-600 text-white shadow-sm'
//                                             : 'text-slate-400 hover:text-white'
//                                             }`}
//                                     >
//                                         Filter
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Conditional Rendering based on mode */}
//                             {locationMode === 'manual' ? (
//                                 <div className="relative" ref={locationInputRef}>
//                                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
//                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                                         </svg>
//                                     </div>
//                                     <input
//                                         type="text"
//                                         id="location"
//                                         value={location}
//                                         disabled={!isSignedIn}
//                                         onChange={(e) => handleLocationChange(e.target.value)}
//                                         onFocus={() => location.length >= 3 && setShowLocationSuggestions(true)}
//                                         placeholder="City, area, or zip code"
//                                         className="w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
//                                         autoComplete="off"
//                                     />
//                                     {isLoadingLocations && (
//                                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                                             <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                             </svg>
//                                         </div>
//                                     )}
//                                     {location && !isLoadingLocations && isSignedIn && (
//                                         <button
//                                             type="button"
//                                             onClick={() => setLocation('')}
//                                             className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
//                                         >
//                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                             </svg>
//                                         </button>
//                                     )}
//                                     {showLocationSuggestions && locationSuggestionsState.length > 0 && (
//                                         <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
//                                             {locationSuggestionsState.map((suggestion, index) => (
//                                                 <div
//                                                     key={index}
//                                                     onClick={() => selectLocationSuggestion(suggestion)}
//                                                     className="px-4 py-2.5 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0"
//                                                 >
//                                                     <div className="flex items-start gap-2">
//                                                         <svg className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                                                         </svg>
//                                                         <div className="flex-1 min-w-0">
//                                                             <p className="text-sm text-white font-medium truncate">
//                                                                 {suggestion.city || suggestion.displayName?.split(',')[0]}
//                                                             </p>
//                                                             <p className="text-xs text-slate-400 truncate">
//                                                                 {suggestion.state}, {suggestion.country}
//                                                             </p>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             ) : (
//                                 <LocationFilter
//                                     onLocationSelect={setFilterLocation}
//                                     initialLocation={filterLocation}
//                                 />
//                             )}
//                         </div>

//                         {/* Search Button - Takes 2 columns */}
//                         <div className="lg:col-span-2 flex items-end gap-2">
//                             {/* Search Button */}
//                             <button
//                                 type="submit"
//                                 disabled={loading || !isSignedIn}
//                                 className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
//                             >
//                                 {loading && !showLocationSuggestions ? (
//                                     <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg>
//                                 ) : (
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                                     </svg>
//                                 )}
//                                 <span>Search</span>
//                             </button>

//                             {/* Force Refresh Button */}
//                             <button
//                                 type="button"
//                                 onClick={(e) => handleSubmit(e, true)}
//                                 disabled={loading || !isSignedIn}
//                                 title="Force refresh (ignore cache)"
//                                 className="px-4 py-3.5 bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
//                             >
//                                 <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                                 </svg>
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default SearchForm;

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Fuse from 'fuse.js';
import { businessKeywords } from '../utils/suggestions';
import LocationFilter from './LocationFilter';

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

    // Location mode toggle
    const [locationMode, setLocationMode] = useState('filter');
    const [filterLocation, setFilterLocation] = useState(null);

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

        const locationString = locationMode === 'filter' && filterLocation
            ? filterLocation.formatted
            : location;

        if (!keyword || !locationString) {
            alert('Please enter both keyword and location');
            return;
        }

        setLoading(true);
        setShowKeywordSuggestions(false);
        setShowLocationSuggestions(false);

        try {
            const token = isSignedIn ? await getToken() : null;
            await onSearch(keyword, locationString, token, refresh);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-20">
            {/* Main Container with Gradient Border Effect */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-[1px] shadow-2xl">
                <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 relative">
                    {/* Subtle Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                            backgroundSize: '32px 32px'
                        }}></div>
                    </div>

                    {/* Guest Overlay */}
                    {!isSignedIn && (
                        <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-md rounded-2xl flex items-center justify-center p-6 transition-all duration-300">
                            <div className="text-center transform hover:scale-105 transition-transform duration-300">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl mb-4 shadow-2xl border border-slate-600">
                                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-white font-bold text-xl mb-2">Authentication Required</h3>
                                <p className="text-slate-400 text-sm max-w-xs mx-auto">Sign in to unlock powerful lead generation tools</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={(e) => handleSubmit(e)} className="relative">
                        <div className={`transition-all duration-300 ${!isSignedIn ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                {/* Business Type Input - 3 columns */}
                                <div className="lg:col-span-3 relative" ref={keywordInputRef}>
                                    <label className="block text-sm font-semibold text-slate-200 mb-2.5 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                        Business Type
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors">
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
                                            placeholder="e.g., restaurants, gyms"
                                            className="w-full pl-12 pr-11 py-3.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 font-medium"
                                            autoComplete="off"
                                        />
                                        {keyword && isSignedIn && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setKeyword('');
                                                    setKeywordSuggestions([]);
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Keyword Suggestions Dropdown */}
                                    {showKeywordSuggestions && keywordSuggestions.length > 0 && (
                                        <div className="absolute z-[999] left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {keywordSuggestions.map((suggestion, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => selectKeywordSuggestion(suggestion)}
                                                    className="px-4 py-3 hover:bg-slate-700/70 cursor-pointer text-slate-200 text-sm flex items-center gap-3 border-b border-slate-700/50 last:border-0 transition-all duration-150 group"
                                                >
                                                    <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                    <span className="group-hover:text-white transition-colors">{suggestion}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Location Section - 7 columns */}
                                <div className="lg:col-span-7 relative">
                                    <div className="flex items-center justify-between mb-2.5">
                                        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                            Location
                                        </label>
                                        <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/50 rounded-lg p-1">
                                            <button
                                                type="button"
                                                onClick={() => setLocationMode('manual')}
                                                disabled={!isSignedIn}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${locationMode === 'manual'
                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                Manual
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setLocationMode('filter')}
                                                disabled={!isSignedIn}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${locationMode === 'filter'
                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                Filter
                                            </button>
                                        </div>
                                    </div>

                                    {/* Conditional Location Input */}
                                    {locationMode === 'manual' ? (
                                        <div className="relative group" ref={locationInputRef}>
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors">
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
                                                placeholder="City, state, or zip code"
                                                className="w-full pl-12 pr-11 py-3.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 font-medium"
                                                autoComplete="off"
                                            />
                                            {isLoadingLocations && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                </div>
                                            )}
                                            {location && !isLoadingLocations && isSignedIn && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setLocation('');
                                                        setLocationSuggestionsState([]);
                                                    }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}

                                            {/* Location Suggestions Dropdown */}
                                            {showLocationSuggestions && locationSuggestionsState.length > 0 && (
                                                <div className="absolute z-[999] left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {locationSuggestionsState.map((suggestion, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => selectLocationSuggestion(suggestion)}
                                                            className="px-4 py-3 hover:bg-slate-700/70 cursor-pointer border-b border-slate-700/50 last:border-0 transition-all duration-150 group"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-400 mt-0.5 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                </svg>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm text-white font-semibold truncate group-hover:text-white transition-colors">
                                                                        {suggestion.city || suggestion.displayName?.split(',')[0]}
                                                                    </p>
                                                                    <p className="text-xs text-slate-400 truncate mt-0.5">
                                                                        {suggestion.state}, {suggestion.country}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <LocationFilter
                                            onLocationSelect={setFilterLocation}
                                            initialLocation={filterLocation}
                                        />
                                    )}
                                </div>

                                {/* Action Buttons - 2 columns */}
                                <div className="lg:col-span-2 flex items-end gap-2">
                                    {/* Search Button */}
                                    <button
                                        type="submit"
                                        disabled={loading || !isSignedIn}
                                        className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 group"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Searching...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                <span>Search</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Force Refresh Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, true)}
                                        disabled={loading || !isSignedIn}
                                        title="Force refresh (bypass cache)"
                                        className="px-4 py-3.5 bg-slate-700/60 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600/50 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-lg hover:shadow-xl group"
                                    >
                                        <svg className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Bottom Gradient Glow */}
            <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        </div>
    );
};

export default SearchForm;