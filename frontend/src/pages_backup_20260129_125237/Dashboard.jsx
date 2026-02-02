

import { useState } from 'react';
import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useTheme } from '../context/ThemeContext';
import SearchForm from '../components/SearchForm';
import SearchHistory from '../components/SearchHistory';
import BusinessTable from '../components/BusinessTable';
import BusinessMap from '../components/BusinessMap';
import ExportButtons from '../components/ExportButtons';
import JobStatus from '../components/JobStatus';
import { searchBusinesses, createSearchJob } from '../api/business.api';

const Dashboard = () => {
    const { user, isSignedIn } = useUser();
    const { isDark, toggleTheme } = useTheme();
    const [businesses, setBusinesses] = useState([]);
    const [error, setError] = useState('');
    const [selectedKeyword, setSelectedKeyword] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [useAsyncSearch, setUseAsyncSearch] = useState(true);
    const [currentJobId, setCurrentJobId] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [filterRating, setFilterRating] = useState(0);
    const [sortBy, setSortBy] = useState('relevance');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [priceRange, setPriceRange] = useState('all');
    const [openNow, setOpenNow] = useState(false);

    // Enhanced stats calculation
    const stats = {
        total: businesses.length,
        avgRating: businesses.length > 0
            ? (businesses.reduce((sum, b) => sum + (b.rating || 0), 0) / businesses.length).toFixed(1)
            : 0,
        withWebsite: businesses.filter(b => b.website).length,
        withPhone: businesses.filter(b => b.phone).length,
        highlyRated: businesses.filter(b => (b.rating || 0) >= 4.5).length,
        verified: businesses.filter(b => b.verified).length,
    };

    const handleSearch = async (keyword, location, token) => {
        try {
            setError('');
            setBusinesses([]);
            setCurrentJobId(null);
            setIsSearching(true);
            setSelectedKeyword(keyword);
            setSelectedLocation(location);

            if (useAsyncSearch) {
                const result = await createSearchJob(keyword, location, token);
                setCurrentJobId(result.jobId);
            } else {
                const result = await searchBusinesses(keyword, location, token);
                setBusinesses(result.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch businesses');
            setBusinesses([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleJobComplete = (data) => {
        setBusinesses(data);
        setCurrentJobId(null);
        setIsSearching(false);
    };

    const handleSelectHistory = (keyword, location) => {
        setSelectedKeyword(keyword);
        setSelectedLocation(location);
    };

    // Advanced filtering
    const filteredBusinesses = businesses
        .filter(b => !filterRating || (b.rating || 0) >= filterRating)
        .filter(b => priceRange === 'all' || b.priceLevel === priceRange)
        .filter(b => !openNow || b.isOpenNow)
        .sort((a, b) => {
            if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
            if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
            if (sortBy === 'distance') return (a.distance || 0) - (b.distance || 0);
            return 0;
        });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Professional Navbar */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">LeadFinder</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Business Intelligence Platform</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Toggle theme"
                            >
                                {isDark ? (
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                    </svg>
                                )}
                            </button>

                            {isSignedIn ? (
                                <div className="flex items-center space-x-3">
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user?.firstName || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
                                    </div>
                                    <UserButton />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <SignInButton mode="modal">
                                        <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                                            Sign In
                                        </button>
                                    </SignInButton>
                                    <SignUpButton mode="modal">
                                        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                                            Get Started
                                        </button>
                                    </SignUpButton>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Business Search
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Find and analyze local businesses with comprehensive data from Google Maps
                    </p>
                </div>

                {/* Search Mode Toggle */}
                <div className="mb-6">
                    <div className="inline-flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setUseAsyncSearch(false)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!useAsyncSearch
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            Instant Search
                        </button>
                        <button
                            onClick={() => setUseAsyncSearch(true)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${useAsyncSearch
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            Background Job
                        </button>
                    </div>
                </div>

                {/* Search Form */}
                <div className="mb-8">
                    <SearchForm
                        onSearch={handleSearch}
                        initialKeyword={selectedKeyword}
                        initialLocation={selectedLocation}
                    />
                </div>

                {/* Stats Dashboard */}
                {businesses.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        {[
                            { label: 'Total Results', value: stats.total, icon: '📊' },
                            { label: 'Avg Rating', value: `${stats.avgRating} ★`, icon: '⭐' },
                            { label: 'Top Rated', value: stats.highlyRated, icon: '🏆' },
                            { label: 'With Website', value: stats.withWebsite, icon: '🌐' },
                            { label: 'With Phone', value: stats.withPhone, icon: '📞' },
                            { label: 'Verified', value: stats.verified, icon: '✓' }
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl">{stat.icon}</span>
                                </div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Job Status */}
                {currentJobId && (
                    <div className="mb-6">
                        <JobStatus jobId={currentJobId} onComplete={handleJobComplete} />
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Error</h4>
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls Bar */}
                {businesses.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
                        <div className="space-y-4">
                            {/* Main Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                {/* View Mode */}
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
                                    <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600">
                                        {['table', 'map', 'grid'].map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setViewMode(mode)}
                                                className={`px-4 py-2 text-sm font-medium capitalize ${viewMode === mode
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="flex items-center space-x-4">
                                    <select
                                        value={filterRating}
                                        onChange={(e) => setFilterRating(Number(e.target.value))}
                                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={0}>All Ratings</option>
                                        <option value={3.5}>3.5+ Stars</option>
                                        <option value={4}>4+ Stars</option>
                                        <option value={4.5}>4.5+ Stars</option>
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="relevance">Sort by Relevance</option>
                                        <option value="rating">Highest Rated</option>
                                        <option value="reviews">Most Reviews</option>
                                        <option value="distance">Distance</option>
                                    </select>

                                    <button
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                                    >
                                        {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                                    </button>

                                    <ExportButtons businesses={filteredBusinesses} />
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            {showAdvancedFilters && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Price Range
                                            </label>
                                            <select
                                                value={priceRange}
                                                onChange={(e) => setPriceRange(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option value="all">All Prices</option>
                                                <option value="$">$ - Budget</option>
                                                <option value="$$">$$ - Moderate</option>
                                                <option value="$$$">$$$ - Expensive</option>
                                                <option value="$$$$">$$$$ - Luxury</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Business Hours
                                            </label>
                                            <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={openNow}
                                                    onChange={(e) => setOpenNow(e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-900 dark:text-white">Open Now</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Results
                                            </label>
                                            <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {filteredBusinesses.length} of {businesses.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sticky top-24">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Recent Searches</h3>
                            <SearchHistory onSelect={handleSelectHistory} />
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-3">
                        {businesses.length > 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {filteredBusinesses.length} Results
                                    </h3>
                                    {selectedKeyword && selectedLocation && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            "{selectedKeyword}" in {selectedLocation}
                                        </p>
                                    )}
                                </div>

                                <div className="p-4">
                                    {viewMode === 'table' && <BusinessTable businesses={filteredBusinesses} />}
                                    {viewMode === 'map' && <BusinessMap businesses={filteredBusinesses} />}
                                    {viewMode === 'grid' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {filteredBusinesses.map((business, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => setSelectedBusiness(business)}
                                                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                                >
                                                    {/* Image */}
                                                    <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                                                        {business.photoUrl ? (
                                                            <img
                                                                src={business.photoUrl}
                                                                alt={business.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}

                                                        {business.isOpenNow !== undefined && (
                                                            <div className="absolute top-2 right-2">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded ${business.isOpenNow
                                                                    ? 'bg-green-500 text-white'
                                                                    : 'bg-gray-500 text-white'
                                                                    }`}>
                                                                    {business.isOpenNow ? 'Open' : 'Closed'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                                                {business.name}
                                                            </h4>
                                                            {business.verified && (
                                                                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>

                                                        {business.rating && (
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {business.rating} ★
                                                                </span>
                                                                {business.reviewCount && (
                                                                    <span className="text-xs text-gray-500">
                                                                        ({business.reviewCount})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {business.category && (
                                                            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded mb-2">
                                                                {business.category}
                                                            </span>
                                                        )}

                                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                                            {business.address}
                                                        </p>

                                                        {(business.phone || business.website) && (
                                                            <div className="space-y-1 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                                {business.phone && (
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                        📞 {business.phone}
                                                                    </p>
                                                                )}
                                                                {business.website && (
                                                                    <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                                                        🌐 Website Available
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : !error && !currentJobId && !isSearching ? (
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Start Your Search
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Enter a keyword and location to find businesses
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Business Detail Modal */}
            {selectedBusiness && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={() => setSelectedBusiness(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative">
                            <div className="h-48 bg-gray-200 dark:bg-gray-700">
                                {selectedBusiness.photoUrl ? (
                                    <img
                                        src={selectedBusiness.photoUrl}
                                        alt={selectedBusiness.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedBusiness(null)}
                                className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {selectedBusiness.name}
                                    </h2>
                                    {selectedBusiness.category && (
                                        <span className="inline-block px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                            {selectedBusiness.category}
                                        </span>
                                    )}
                                </div>
                                {selectedBusiness.rating && (
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {selectedBusiness.rating} ★
                                        </div>
                                        {selectedBusiness.reviewCount && (
                                            <div className="text-sm text-gray-500">
                                                {selectedBusiness.reviewCount} reviews
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {selectedBusiness.address && (
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</p>
                                            <p className="text-sm text-gray-900 dark:text-white">{selectedBusiness.address}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedBusiness.phone && (
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</p>
                                            <a href={`tel:${selectedBusiness.phone}`} className="text-sm text-blue-600 hover:underline">
                                                {selectedBusiness.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {selectedBusiness.website && (
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</p>
                                            <a
                                                href={selectedBusiness.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline break-all"
                                            >
                                                Visit Website
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {selectedBusiness.priceLevel && (
                                    <div className="flex items-start space-x-3">
                                        <span className="text-gray-400 mt-0.5">💰</span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Range</p>
                                            <p className="text-sm text-gray-900 dark:text-white">{selectedBusiness.priceLevel}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedBusiness.isOpenNow !== undefined && (
                                    <div className="flex items-start space-x-3">
                                        <span className="text-gray-400 mt-0.5">🕒</span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${selectedBusiness.isOpenNow
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {selectedBusiness.isOpenNow ? 'Open Now' : 'Closed'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBusiness.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Get Directions
                                </a>
                                <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;