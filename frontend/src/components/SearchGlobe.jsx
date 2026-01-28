import { useEffect, useState } from 'react';
import { getSearchHistory } from '../api/business.api';

const CITY_COORDS = {
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'surat': { lat: 21.1702, lng: 72.8311 },
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    'new york': { lat: 40.7128, lng: -74.0060 },
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    'chicago': { lat: 41.8781, lng: -87.6298 },
    'london': { lat: 51.5074, lng: -0.1278 },
    'paris': { lat: 48.8566, lng: 2.3522 },
    'tokyo': { lat: 35.6762, lng: 139.6503 },
    'dubai': { lat: 25.2048, lng: 55.2708 },
    'singapore': { lat: 1.3521, lng: 103.8198 },
};

// Convert lat/lng to SVG coordinates
const latLngToSVG = (lat, lng, width = 800, height = 400) => {
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
};

const SearchGlobe = ({ currentSearchLocation = null }) => {
    const [searches, setSearches] = useState([]);
    const [currentLocationCoords, setCurrentLocationCoords] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAllSearches();
        const interval = setInterval(fetchAllSearches, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (currentSearchLocation) {
            const coords = getCoordsForLocation(currentSearchLocation);
            if (coords) {
                setCurrentLocationCoords({
                    lat: coords.lat,
                    lng: coords.lng,
                    location: currentSearchLocation,
                });
            }
        }
    }, [currentSearchLocation]);

    const fetchAllSearches = async () => {
        try {
            const result = await getSearchHistory(50);

            const searchMarkers = [];
            for (const search of result.data) {
                const coords = getCoordsForLocation(search.location);
                if (coords) {
                    searchMarkers.push({
                        lat: coords.lat,
                        lng: coords.lng,
                        keyword: search.keyword,
                        location: search.location,
                    });
                }
            }

            setSearches(searchMarkers);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch searches:', error);
            setIsLoading(false);
        }
    };

    const getCoordsForLocation = (location) => {
        const normalizedLocation = location.toLowerCase().trim();
        const cityName = normalizedLocation.split(',')[0].trim();

        if (CITY_COORDS[cityName]) {
            return CITY_COORDS[cityName];
        }

        if (CITY_COORDS[normalizedLocation]) {
            return CITY_COORDS[normalizedLocation];
        }

        return null;
    };

    if (isLoading) {
        return (
            <div className="relative w-full flex items-center justify-center" style={{ height: '600px' }}>
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-purple-500/20 animate-pulse">
                        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-purple-600 dark:text-purple-400 font-medium">Loading Map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full" style={{ height: '600px' }}>
            {/* Header badge */}
            <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-md rounded-xl px-4 py-2 shadow-2xl border border-white/20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">Live Search Map</div>
                        <div className="text-xs text-white/80">{searches.length} searches worldwide</div>
                    </div>
                </div>
            </div>

            {/* Live badge */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-green-500/90 backdrop-blur-md rounded-full border border-green-300/30 shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-white">LIVE</span>
            </div>

            {/* World Map SVG */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 p-8">
                <svg
                    viewBox="0 0 800 400"
                    className="w-full h-full"
                    style={{ filter: 'drop-shadow(0 0 30px rgba(139, 92, 246, 0.3))' }}
                >
                    {/* Simple world outline */}
                    <defs>
                        <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.3 }} />
                            <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0.3 }} />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[...Array(10)].map((_, i) => (
                        <line
                            key={`h-${i}`}
                            x1="0"
                            y1={i * 40}
                            x2="800"
                            y2={i * 40}
                            stroke="rgba(139, 92, 246, 0.1)"
                            strokeWidth="1"
                        />
                    ))}
                    {[...Array(20)].map((_, i) => (
                        <line
                            key={`v-${i}`}
                            x1={i * 40}
                            y1="0"
                            x2={i * 40}
                            y2="400"
                            stroke="rgba(139, 92, 246, 0.1)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Continents outline (simplified) */}
                    <ellipse cx="150" cy="140" rx="80" ry="60" fill="url(#mapGradient)" opacity="0.3" />
                    <ellipse cx="350" cy="120" rx="120" ry="80" fill="url(#mapGradient)" opacity="0.3" />
                    <ellipse cx="550" cy="180" rx="100" ry="90" fill="url(#mapGradient)" opacity="0.3" />
                    <ellipse cx="250" cy="280" rx="90" ry="70" fill="url(#mapGradient)" opacity="0.3" />

                    {/* Search markers */}
                    {searches.map((search, index) => {
                        const { x, y } = latLngToSVG(search.lat, search.lng);
                        return (
                            <g key={index}>
                                {/* Ripple effect */}
                                <circle cx={x} cy={y} r="8" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.5">
                                    <animate
                                        attributeName="r"
                                        from="4"
                                        to="12"
                                        dur="2s"
                                        repeatCount="indefinite"
                                    />
                                    <animate
                                        attributeName="opacity"
                                        from="0.8"
                                        to="0"
                                        dur="2s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                                {/* Main marker */}
                                <circle cx={x} cy={y} r="4" fill="#8b5cf6" className="cursor-pointer hover:r-6 transition-all">
                                    <title>{`${search.keyword} in ${search.location}`}</title>
                                </circle>
                            </g>
                        );
                    })}

                    {/* Current location marker */}
                    {currentLocationCoords && (() => {
                        const { x, y } = latLngToSVG(currentLocationCoords.lat, currentLocationCoords.lng);
                        return (
                            <g>
                                {/* Pulsing ring */}
                                <circle cx={x} cy={y} r="12" fill="none" stroke="#ec4899" strokeWidth="3">
                                    <animate
                                        attributeName="r"
                                        from="8"
                                        to="20"
                                        dur="1.5s"
                                        repeatCount="indefinite"
                                    />
                                    <animate
                                        attributeName="opacity"
                                        from="1"
                                        to="0"
                                        dur="1.5s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                                {/* Main marker */}
                                <circle cx={x} cy={y} r="6" fill="#ec4899" />
                                <circle cx={x} cy={y} r="3" fill="#fff" />
                            </g>
                        );
                    })()}
                </svg>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-gradient-to-br from-slate-900/90 to-purple-900/90 backdrop-blur-md rounded-xl p-4 border border-purple-500/30 shadow-2xl">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></div>
                        <span className="text-sm font-medium text-purple-200">Other Searches</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-pink-500 animate-pulse shadow-lg shadow-pink-500/50"></div>
                        <span className="text-sm font-medium text-pink-200">Your Search</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchGlobe;
