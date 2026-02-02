


// import { useState, useEffect, useRef } from 'react';
// import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/clerk-react';
// import { useTheme } from '../context/ThemeContext';
// import SearchForm from '../components/SearchForm';
// import SearchHistory from '../components/SearchHistory';
// import BusinessTable from '../components/BusinessTable';
// import BusinessMap from '../components/BusinessMap';
// import ExportButtons from '../components/ExportButtons';
// import JobStatus from '../components/JobStatus';
// import DeepScanButton from '../components/DeepScanButton';
// import { searchBusinesses, createSearchJob } from '../api/business.api';

// const Dashboard = () => {
//     const { user, isSignedIn } = useUser();
//     const { isDark, toggleTheme } = useTheme();
//     const [businesses, setBusinesses] = useState([]);
//     const [error, setError] = useState('');
//     const [selectedKeyword, setSelectedKeyword] = useState('');
//     const [selectedLocation, setSelectedLocation] = useState('');
//     const [useAsyncSearch, setUseAsyncSearch] = useState(true);
//     const [currentJobId, setCurrentJobId] = useState(null);
//     const [viewMode, setViewMode] = useState('table');
//     const [filterRating, setFilterRating] = useState(0);
//     const [sortBy, setSortBy] = useState('relevance');
//     const [isSearching, setIsSearching] = useState(false);
//     const [selectedBusiness, setSelectedBusiness] = useState(null);
//     const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
//     const [priceRange, setPriceRange] = useState('all');
//     const [openNow, setOpenNow] = useState(false);
//     const [showRecentSearches, setShowRecentSearches] = useState(false);
//     const recentSearchesRef = useRef(null);

//     // Click outside handler for Recent Searches dropdown
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (recentSearchesRef.current && !recentSearchesRef.current.contains(event.target)) {
//                 setShowRecentSearches(false);
//             }
//         };

//         if (showRecentSearches) {
//             document.addEventListener('mousedown', handleClickOutside);
//         }

//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [showRecentSearches]);

//     const stats = {
//         total: businesses.length,
//         avgRating: businesses.length > 0
//             ? (businesses.reduce((sum, b) => sum + (b.rating || 0), 0) / businesses.length).toFixed(1)
//             : 0,
//         withEmail: businesses.filter(b => b.email).length,
//         withWebsite: businesses.filter(b => b.website).length,
//         withPhone: businesses.filter(b => b.phone).length,
//         highlyRated: businesses.filter(b => (b.rating || 0) >= 4.5).length,
//     };

//     const handleSearch = async (keyword, location, token, refresh = false) => {
//         try {
//             setError('');
//             // Only clear businesses if we are NOT doing a refresh (or maybe always clear if we want fresh results)
//             setBusinesses([]);
//             setCurrentJobId(null);
//             setIsSearching(true);
//             setSelectedKeyword(keyword);
//             setSelectedLocation(location);

//             if (useAsyncSearch) {
//                 const result = await createSearchJob(keyword, location, token, refresh);
//                 setCurrentJobId(result.jobId);
//             } else {
//                 const result = await searchBusinesses(keyword, location, token, refresh);
//                 setBusinesses(result.data);
//             }
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to fetch businesses');
//             setBusinesses([]);
//         } finally {
//             setIsSearching(false);
//         }
//     };

//     const handleJobComplete = (data) => {
//         setBusinesses(data);
//         setCurrentJobId(null);
//         setIsSearching(false);
//     };

//     const handleSelectHistory = (keyword, location) => {
//         setSelectedKeyword(keyword);
//         setSelectedLocation(location);
//     };

//     const filteredBusinesses = businesses
//         .filter(b => !filterRating || (b.rating || 0) >= filterRating)
//         .filter(b => priceRange === 'all' || b.priceLevel === priceRange)
//         .filter(b => !openNow || b.isOpenNow)
//         .sort((a, b) => {
//             if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
//             if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
//             if (sortBy === 'distance') return (a.distance || 0) - (b.distance || 0);
//             return 0;
//         });

//     return (
//         <div className="min-h-screen bg-slate-950">
//             {/* Premium Dark Navbar */}
//             <nav className="border-b border-slate-800/50 bg-slate-950/95 backdrop-blur-sm sticky top-0 z-50">
//                 <div className="w-full px-6 lg:px-10">
//                     <div className="flex items-center justify-between h-16">
//                         <div className="flex items-center gap-10">
//                             <div className="flex items-center gap-2.5">
//                                 <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg border border-slate-600">
//                                     <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                                     </svg>
//                                 </div>
//                                 <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">LeadFinder</span>
//                             </div>

//                             <div className="hidden md:flex items-center gap-1">
//                                 <button className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-slate-800/50 border border-slate-700/50">
//                                     Dashboard
//                                 </button>
//                                 <button className="px-4 py-2 text-sm text-slate-400 rounded-lg hover:bg-slate-800/30 hover:text-white transition-colors">
//                                     Analytics
//                                 </button>
//                                 <button className="px-4 py-2 text-sm text-slate-400 rounded-lg hover:bg-slate-800/30 hover:text-white transition-colors">
//                                     Saved
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-4">
//                             <button
//                                 onClick={toggleTheme}
//                                 className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
//                             >
//                                 {isDark ? (
//                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
//                                     </svg>
//                                 ) : (
//                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
//                                     </svg>
//                                 )}
//                             </button>

//                             {isSignedIn ? (
//                                 <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
//                                     <div className="hidden md:block text-right">
//                                         <p className="text-sm font-medium text-white">
//                                             {user?.firstName || 'User'}
//                                         </p>
//                                         <p className="text-xs text-slate-500">{user?.primaryEmailAddress?.emailAddress}</p>
//                                     </div>
//                                     <UserButton />
//                                 </div>
//                             ) : (
//                                 <div className="flex items-center gap-2">
//                                     <SignInButton mode="modal">
//                                         <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
//                                             Sign In
//                                         </button>
//                                     </SignInButton>
//                                     <SignUpButton mode="modal">
//                                         <button className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-all rounded-lg border border-slate-600">
//                                             Get Started
//                                         </button>
//                                     </SignUpButton>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </nav>

//             {/* Full Width Content - Compact */}
//             <div className="w-full px-4 lg:px-8 py-4">
//                 {/* Compact Header with Mode Toggle */}
//                 <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
//                     <div className="flex items-center gap-4">
//                         <h1 className="text-2xl md:text-3xl font-bold text-white">
//                             LeadFinder
//                         </h1>
//                         <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-700 rounded-full">
//                             <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
//                             <span className="text-xs font-medium text-slate-400">AI-Powered</span>
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                         <span className="text-xs text-slate-500">Mode:</span>
//                         <div className="inline-flex bg-slate-900 border border-slate-700 rounded-lg p-0.5">
//                             <button
//                                 onClick={() => setUseAsyncSearch(false)}
//                                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!useAsyncSearch
//                                     ? 'bg-slate-800 text-white shadow-sm'
//                                     : 'text-slate-400 hover:text-white'
//                                     }`}
//                             >
//                                 Instant
//                             </button>
//                             <button
//                                 onClick={() => setUseAsyncSearch(true)}
//                                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${useAsyncSearch
//                                     ? 'bg-slate-800 text-white shadow-sm'
//                                     : 'text-slate-400 hover:text-white'
//                                     }`}
//                             >
//                                 Background
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Search Section - Compact */}
//                 <div className="mb-4">
//                     {/* Search Form */}
//                     <SearchForm
//                         onSearch={handleSearch}
//                         initialKeyword={selectedKeyword}
//                         initialLocation={selectedLocation}
//                     />
//                 </div>

//                 {/* Stats Grid - Compact */}
//                 {businesses.length > 0 && (
//                     <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
//                         {/* Results */}
//                         <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-slate-600 transition-all">
//                             <div className="flex items-center gap-2 mb-2">
//                                 <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
//                                     <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                                     </svg>
//                                 </div>
//                             </div>
//                             <p className="text-xl font-bold text-white">{stats.total}</p>
//                             <p className="text-xs text-slate-500 mt-1">Results Found</p>
//                         </div>

//                         {/* Avg Rating */}
//                         <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-amber-500/50 transition-all">
//                             <div className="flex items-center gap-2 mb-2">
//                                 <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
//                                     <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
//                                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                                     </svg>
//                                 </div>
//                             </div>
//                             <p className="text-xl font-bold text-white">{stats.avgRating}</p>
//                             <p className="text-xs text-slate-500 mt-1">Avg Rating</p>
//                         </div>

//                         {/* Emails */}
//                         <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-blue-500/50 transition-all">
//                             <div className="flex items-center gap-2 mb-2">
//                                 <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
//                                     <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                                     </svg>
//                                 </div>
//                             </div>
//                             <p className="text-xl font-bold text-white">{stats.withEmail}</p>
//                             <p className="text-xs text-slate-500 mt-1">With Email</p>
//                             <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
//                                 <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(stats.withEmail / stats.total) * 100}%` }}></div>
//                             </div>
//                         </div>

//                         {/* Websites */}
//                         <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-slate-600 transition-all">
//                             <div className="flex items-center gap-2 mb-2">
//                                 <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
//                                     <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
//                                     </svg>
//                                 </div>
//                             </div>
//                             <p className="text-xl font-bold text-white">{stats.withWebsite}</p>
//                             <p className="text-xs text-slate-500 mt-1">With Website</p>
//                             <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
//                                 <div className="h-full bg-slate-500 rounded-full transition-all" style={{ width: `${(stats.withWebsite / stats.total) * 100}%` }}></div>
//                             </div>
//                         </div>

//                         {/* Phone */}
//                         <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-green-500/50 transition-all">
//                             <div className="flex items-center gap-2 mb-2">
//                                 <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
//                                     <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                                     </svg>
//                                 </div>
//                             </div>
//                             <p className="text-xl font-bold text-white">{stats.withPhone}</p>
//                             <p className="text-xs text-slate-500 mt-1">With Phone</p>
//                             <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
//                                 <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(stats.withPhone / stats.total) * 100}%` }}></div>
//                             </div>
//                         </div>

//                         {/* Top Rated */}
//                         <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-rose-500/50 transition-all">
//                             <div className="flex items-center gap-2 mb-2">
//                                 <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center">
//                                     <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
//                                     </svg>
//                                 </div>
//                             </div>
//                             <p className="text-xl font-bold text-white">{stats.highlyRated}</p>
//                             <p className="text-xs text-slate-500 mt-1">Top Rated (4.5+)</p>
//                             <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
//                                 <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${(stats.highlyRated / stats.total) * 100}%` }}></div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Job Status */}
//                 {currentJobId && (
//                     <div className="mb-8">
//                         <JobStatus jobId={currentJobId} onComplete={handleJobComplete} />
//                     </div>
//                 )}

//                 {/* Error */}
//                 {error && (
//                     <div className="mb-8 border-l-4 border-red-500 bg-red-900/20 p-5 rounded-r-lg">
//                         <p className="text-sm font-medium text-red-300">{error}</p>
//                     </div>
//                 )}

//                 {/* Controls Panel - Dark Theme */}
//                 {businesses.length > 0 && (
//                     <div className="bg-slate-900/50 border border-slate-800 mb-8 rounded-xl">
//                         <div className="p-5">
//                             <div className="flex flex-wrap items-center justify-between gap-4">
//                                 {/* View Toggle */}
//                                 <div className="inline-flex bg-slate-800 border border-slate-700 rounded-lg p-1">
//                                     {['table', 'map', 'grid'].map((mode) => (
//                                         <button
//                                             key={mode}
//                                             onClick={() => setViewMode(mode)}
//                                             className={`px-4 py-2 text-sm font-medium capitalize rounded-md transition-all ${viewMode === mode
//                                                 ? 'bg-slate-700 text-white shadow-sm'
//                                                 : 'text-slate-400 hover:text-white'
//                                                 }`}
//                                         >
//                                             {mode}
//                                         </button>
//                                     ))}
//                                 </div>

//                                 {/* Filters + Recent Searches */}
//                                 <div className="flex items-center gap-3">
//                                     {/* Recent Searches Button */}
//                                     <div className="relative" ref={recentSearchesRef}>
//                                         <button
//                                             onClick={() => setShowRecentSearches(!showRecentSearches)}
//                                             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 border border-slate-700 rounded-lg hover:border-slate-600 hover:bg-slate-800 transition-all"
//                                         >
//                                             <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                             </svg>
//                                             Recent
//                                             <svg className={`w-4 h-4 text-slate-500 transition-transform ${showRecentSearches ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                                             </svg>
//                                         </button>

//                                         {/* Recent Searches Dropdown */}
//                                         {showRecentSearches && (
//                                             <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-slate-900 border border-slate-700 rounded-xl shadow-lg shadow-black/20 z-50 max-h-[400px] overflow-y-auto">
//                                                 <div className="p-3 border-b border-slate-700 bg-slate-800/50">
//                                                     <h3 className="text-sm font-medium text-white flex items-center gap-2">
//                                                         <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                                         </svg>
//                                                         Recent Searches
//                                                     </h3>
//                                                 </div>
//                                                 <div className="p-2">
//                                                     <SearchHistory onSelectHistory={(keyword, location) => {
//                                                         handleSelectHistory(keyword, location);
//                                                         setShowRecentSearches(false);
//                                                     }} />
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>

//                                     <select
//                                         value={filterRating}
//                                         onChange={(e) => setFilterRating(Number(e.target.value))}
//                                         className="px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:border-slate-500"
//                                     >
//                                         <option value={0}>All Ratings</option>
//                                         <option value={3.5}>3.5+</option>
//                                         <option value={4}>4.0+</option>
//                                         <option value={4.5}>4.5+</option>
//                                     </select>

//                                     <select
//                                         value={sortBy}
//                                         onChange={(e) => setSortBy(e.target.value)}
//                                         className="px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:border-slate-500"
//                                     >
//                                         <option value="relevance">Relevance</option>
//                                         <option value="rating">Rating</option>
//                                         <option value="reviews">Reviews</option>
//                                         <option value="distance">Distance</option>
//                                     </select>

//                                     <button
//                                         onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//                                         className="px-4 py-2 text-sm font-medium text-slate-300 border border-slate-700 rounded-lg hover:border-slate-600 hover:bg-slate-800 transition-all"
//                                     >
//                                         {showAdvancedFilters ? 'Less' : 'More'}
//                                     </button>

//                                     <ExportButtons businesses={filteredBusinesses} />
//                                 </div>
//                             </div>

//                             {/* Advanced Filters */}
//                             {showAdvancedFilters && (
//                                 <div className="mt-5 pt-5 border-t border-slate-700">
//                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                         <div>
//                                             <label className="block text-sm font-medium text-slate-400 mb-2">
//                                                 Price Range
//                                             </label>
//                                             <select
//                                                 value={priceRange}
//                                                 onChange={(e) => setPriceRange(e.target.value)}
//                                                 className="w-full px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:border-slate-500"
//                                             >
//                                                 <option value="all">All</option>
//                                                 <option value="$">$</option>
//                                                 <option value="$$">$$</option>
//                                                 <option value="$$$">$$$</option>
//                                                 <option value="$$$$">$$$$</option>
//                                             </select>
//                                         </div>

//                                         <div>
//                                             <label className="block text-sm font-medium text-slate-400 mb-2">
//                                                 Status
//                                             </label>
//                                             <label className="flex items-center gap-2 px-3 py-2 border border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 transition-colors bg-slate-800">
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={openNow}
//                                                     onChange={(e) => setOpenNow(e.target.checked)}
//                                                     className="w-4 h-4 rounded border-slate-600 text-slate-400 focus:ring-slate-500 bg-slate-700"
//                                                 />
//                                                 <span className="text-sm text-white">Open Now</span>
//                                             </label>
//                                         </div>

//                                         <div>
//                                             <label className="block text-sm font-medium text-slate-400 mb-2">
//                                                 Filtered
//                                             </label>
//                                             <div className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800">
//                                                 <span className="text-sm font-medium text-white">
//                                                     {filteredBusinesses.length} / {businesses.length}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 )}

//                 {/* Premium Content Layout - Cards + Map Side by Side */}
//                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//                     {/* Main Content Area - Cards + Map */}
//                     {businesses.length > 0 ? (
//                         <>
//                             {/* Cards Section - Left/Top */}
//                             <div className="xl:col-span-2">
//                                 <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
//                                     {/* Header */}
//                                     <div className="border-b border-slate-800 p-6 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
//                                         <div className="flex items-center justify-between">
//                                             <div>
//                                                 <h2 className="text-xl font-bold text-white mb-1">
//                                                     {filteredBusinesses.length} Leads Found
//                                                 </h2>
//                                                 {selectedKeyword && selectedLocation && (
//                                                     <p className="text-sm text-slate-400">
//                                                         🔍 {selectedKeyword} • 📍 {selectedLocation}
//                                                     </p>
//                                                 )}
//                                             </div>
//                                             <div className="flex gap-2">
//                                                 {['cards', 'table'].map((mode) => (
//                                                     <button
//                                                         key={mode}
//                                                         onClick={() => setViewMode(mode)}
//                                                         className={`px-4 py-2 text-xs font-semibold uppercase rounded-lg transition-all ${viewMode === mode
//                                                             ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg shadow-black/30'
//                                                             : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
//                                                             }`}
//                                                     >
//                                                         {mode}
//                                                     </button>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Cards Grid or Table */}
//                                     <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
//                                         {viewMode === 'table' ? (
//                                             <BusinessTable businesses={filteredBusinesses} />
//                                         ) : (
//                                             <div className="space-y-4">
//                                                 {filteredBusinesses.map((business, index) => (
//                                                     <div
//                                                         key={index}
//                                                         onClick={() => setSelectedBusiness(business)}
//                                                         className="group relative bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-slate-600/10 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer"
//                                                     >
//                                                         {/* Gradient accent line */}
//                                                         <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity z-10" />

//                                                         {/* Image Banner at Top */}
//                                                         <div className="relative w-full h-48 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 overflow-hidden">
//                                                             {business.photoUrl ? (
//                                                                 <img
//                                                                     src={business.photoUrl}
//                                                                     alt={business.name}
//                                                                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                                                                     onError={(e) => {
//                                                                         e.target.style.display = 'none';
//                                                                         e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800"><div class="text-center"><div class="text-6xl mb-2">🏢</div><p class="text-sm text-slate-400">No image available</p></div></div>';
//                                                                     }}
//                                                                 />
//                                                             ) : (
//                                                                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
//                                                                     <div className="text-center">
//                                                                         <div className="text-6xl mb-2">🏢</div>
//                                                                         <p className="text-sm text-slate-400">No image available</p>
//                                                                     </div>
//                                                                 </div>
//                                                             )}

//                                                             {/* Open/Closed Badge */}
//                                                             {business.isOpenNow !== undefined && (
//                                                                 <div className="absolute top-3 right-3">
//                                                                     <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full backdrop-blur-sm ${business.isOpenNow
//                                                                         ? 'bg-green-500/90 text-white'
//                                                                         : 'bg-red-500/90 text-white'
//                                                                         }`}>
//                                                                         {business.isOpenNow ? 'Open Now' : 'Closed'}
//                                                                     </span>
//                                                                 </div>
//                                                             )}

//                                                             {/* Rating Badge */}
//                                                             {business.rating && (
//                                                                 <div className="absolute bottom-3 left-3">
//                                                                     <div className="flex items-center gap-1.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
//                                                                         <span className="text-amber-500">⭐</span>
//                                                                         <span className="text-sm font-bold text-zinc-900 dark:text-white">
//                                                                             {business.rating}
//                                                                         </span>
//                                                                         {business.reviewCount && (
//                                                                             <span className="text-xs text-zinc-500 dark:text-zinc-400">
//                                                                                 ({business.reviewCount})
//                                                                             </span>
//                                                                         )}
//                                                                     </div>
//                                                                 </div>
//                                                             )}
//                                                         </div>

//                                                         {/* Card Content */}
//                                                         <div className="p-5">
//                                                             {/* Name & Verified */}
//                                                             <div className="flex items-start justify-between mb-3">
//                                                                 <div className="flex items-center gap-2 flex-1">
//                                                                     <h4 className="font-bold text-xl text-zinc-900 dark:text-white line-clamp-1">
//                                                                         {business.name}
//                                                                     </h4>
//                                                                     {business.verified && (
//                                                                         <span className="text-blue-500 flex-shrink-0" title="Verified">✓</span>
//                                                                     )}
//                                                                 </div>
//                                                             </div>

//                                                             {/* Category & Price */}
//                                                             <div className="flex items-center gap-2 mb-4">
//                                                                 {business.category && (
//                                                                     <span className="px-2.5 py-1 text-xs font-semibold bg-slate-800 dark:bg-slate-800/30 text-slate-300 dark:text-slate-300 rounded-full">
//                                                                         {business.category}
//                                                                     </span>
//                                                                 )}
//                                                                 {business.priceLevel && (
//                                                                     <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
//                                                                         {business.priceLevel}
//                                                                     </span>
//                                                                 )}
//                                                             </div>

//                                                             {/* Contact Info Grid */}
//                                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
//                                                                 {business.phone && (
//                                                                     <a
//                                                                         href={`tel:${business.phone}`}
//                                                                         onClick={(e) => e.stopPropagation()}
//                                                                         className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-slate-400 transition-colors p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
//                                                                     >
//                                                                         <span className="text-green-500 text-lg">📞</span>
//                                                                         <span className="truncate font-medium">{business.phone}</span>
//                                                                     </a>
//                                                                 )}
//                                                                 {business.email && (
//                                                                     <a
//                                                                         href={`mailto:${business.email.split(',')[0]}`}
//                                                                         onClick={(e) => e.stopPropagation()}
//                                                                         className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-slate-400 transition-colors p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
//                                                                     >
//                                                                         <span className="text-blue-500 text-lg">📧</span>
//                                                                         <span className="truncate font-medium">{business.email.split(',')[0]}</span>
//                                                                     </a>
//                                                                 )}
//                                                                 {business.website && (
//                                                                     <a
//                                                                         href={business.website}
//                                                                         target="_blank"
//                                                                         rel="noopener noreferrer"
//                                                                         onClick={(e) => e.stopPropagation()}
//                                                                         className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-slate-400 transition-colors p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
//                                                                     >
//                                                                         <span className="text-slate-400 text-lg">🌐</span>
//                                                                         <span className="truncate font-medium">Visit Website</span>
//                                                                     </a>
//                                                                 )}
//                                                                 {business.address && (
//                                                                     <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500 p-2">
//                                                                         <span className="text-lg">📍</span>
//                                                                         <span className="truncate text-xs">{business.address}</span>
//                                                                     </div>
//                                                                 )}
//                                                             </div>

//                                                             {/* Social Links */}
//                                                             {(business.facebookUrl || business.instagramUrl || business.linkedinUrl || business.twitterUrl) && (
//                                                                 <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
//                                                                     <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Social:</span>
//                                                                     <div className="flex gap-2">
//                                                                         {business.facebookUrl && (
//                                                                             <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:scale-110 transition-all">
//                                                                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
//                                                                             </a>
//                                                                         )}
//                                                                         {business.instagramUrl && (
//                                                                             <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-900/20 text-slate-600 dark:text-slate-400 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:scale-110 transition-all">
//                                                                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
//                                                                             </a>
//                                                                         )}
//                                                                         {business.linkedinUrl && (
//                                                                             <a href={business.linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:scale-110 transition-all">
//                                                                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
//                                                                             </a>
//                                                                         )}
//                                                                         {business.twitterUrl && (
//                                                                             <a href={business.twitterUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-500 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40 hover:scale-110 transition-all">
//                                                                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
//                                                                             </a>
//                                                                         )}
//                                                                     </div>
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Map Section - Right Side */}
//                             <div className="xl:col-span-1">
//                                 <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden sticky top-24">
//                                     <div className="border-b border-slate-800 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
//                                         <h3 className="text-sm font-bold text-white flex items-center gap-2">
//                                             🗺️ Map View
//                                         </h3>
//                                     </div>
//                                     <div className="h-[500px]">
//                                         <BusinessMap businesses={filteredBusinesses} />
//                                     </div>
//                                 </div>
//                             </div>
//                         </>
//                     ) : !error && !currentJobId && !isSearching ? (
//                         <div className="xl:col-span-3 border-2 border-dashed border-slate-700 bg-gradient-to-br from-slate-900 to-slate-950 p-20 text-center rounded-2xl">
//                             <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl mx-auto mb-8 flex items-center justify-center text-4xl shadow-lg shadow-black/30">
//                                 🚀
//                             </div>
//                             <h3 className="text-3xl font-bold text-white mb-3">
//                                 Start Your Lead Search
//                             </h3>
//                             <p className="text-slate-400 text-lg mb-6">
//                                 Enter a keyword and location to discover businesses with contact details
//                             </p>
//                             <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
//                                 <span className="flex items-center gap-1">📧 Emails</span>
//                                 <span className="flex items-center gap-1">📞 Phone</span>
//                                 <span className="flex items-center gap-1">🌐 Websites</span>
//                                 <span className="flex items-center gap-1">📱 Social</span>
//                             </div>
//                         </div>
//                     ) : null}
//                 </div>
//             </div>

//             {/* Minimalist Modal */}
//             {selectedBusiness && (
//                 <div
//                     className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
//                     onClick={() => setSelectedBusiness(null)}
//                 >
//                     <div
//                         className="bg-slate-900 max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-700 rounded-xl shadow-xl shadow-black/50"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         {/* Header */}
//                         <div className="relative">
//                             <div className="h-56 bg-slate-800">
//                                 {selectedBusiness.photoUrl ? (
//                                     <img
//                                         src={selectedBusiness.photoUrl}
//                                         alt={selectedBusiness.name}
//                                         className="w-full h-full object-cover"
//                                     />
//                                 ) : (
//                                     <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700/30 to-slate-800/30">
//                                         <div className="text-6xl">🏢</div>
//                                     </div>
//                                 )}
//                             </div>

//                             <button
//                                 onClick={() => setSelectedBusiness(null)}
//                                 className="absolute top-4 right-4 p-2 bg-slate-900/90 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
//                             >
//                                 <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>

//                         {/* Content */}
//                         <div className="overflow-y-auto max-h-[calc(90vh-14rem)]">
//                             <div className="p-8">
//                                 <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-700">
//                                     <div>
//                                         <h2 className="text-3xl font-bold text-white mb-2">
//                                             {selectedBusiness.name}
//                                         </h2>
//                                         {selectedBusiness.category && (
//                                             <span className="inline-block px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded-lg">
//                                                 {selectedBusiness.category}
//                                             </span>
//                                         )}
//                                     </div>
//                                     {selectedBusiness.rating && (
//                                         <div className="text-right">
//                                             <div className="text-3xl font-bold text-zinc-900 dark:text-white">
//                                                 {selectedBusiness.rating}
//                                             </div>
//                                             {selectedBusiness.reviewCount && (
//                                                 <div className="text-sm text-zinc-500">
//                                                     {selectedBusiness.reviewCount} reviews
//                                                 </div>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>

//                                 <div className="space-y-5">
//                                     {selectedBusiness.address && (
//                                         <div>
//                                             <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Address</p>
//                                             <p className="text-base text-zinc-900 dark:text-white">{selectedBusiness.address}</p>
//                                         </div>
//                                     )}

//                                     {selectedBusiness.phone && (
//                                         <div>
//                                             <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Phone</p>
//                                             <a href={`tel:${selectedBusiness.phone}`} className="text-base text-zinc-900 dark:text-white hover:underline">
//                                                 {selectedBusiness.phone}
//                                             </a>
//                                         </div>
//                                     )}

//                                     {selectedBusiness.website && (
//                                         <div>
//                                             <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Website</p>

//                                             <a
//                                                 href={selectedBusiness.website}
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className="text-base text-zinc-900 dark:text-white hover:underline break-all"
//                                             >
//                                                 Visit Website
//                                             </a>
//                                         </div>
//                                     )}

//                                     <div className="grid grid-cols-2 gap-4 pt-4">
//                                         {selectedBusiness.priceLevel && (
//                                             <div>
//                                                 <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Price</p>
//                                                 <p className="text-lg font-bold text-zinc-900 dark:text-white">{selectedBusiness.priceLevel}</p>
//                                             </div>
//                                         )}

//                                         {selectedBusiness.isOpenNow !== undefined && (
//                                             <div>
//                                                 <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Status</p>
//                                                 <span className={`inline-block px-3 py-1 text-sm font-medium rounded ${selectedBusiness.isOpenNow
//                                                     ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
//                                                     : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
//                                                     }`}>
//                                                     {selectedBusiness.isOpenNow ? 'Open' : 'Closed'}
//                                                 </span>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex space-x-3">

//                                     <a
//                                         href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBusiness.address)}`}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="flex-1 px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-center font-medium rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
//                                     >
//                                         Directions
//                                     </a>
//                                     <button className="flex-1 px-5 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
//                                         Save
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div >
//             )}
//         </div >
//     );
// };

// export default Dashboard;


import { useState, useEffect, useRef } from 'react';
import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import SearchForm from '../components/SearchForm';
import SearchHistory from '../components/SearchHistory';
import BusinessTable from '../components/BusinessTable';
import BusinessMap from '../components/BusinessMap';
import ExportButtons from '../components/ExportButtons';
import JobStatus from '../components/JobStatus';
import DeepScanButton from '../components/DeepScanButton';
import { searchBusinesses, createSearchJob } from '../api/business.api';

const Dashboard = () => {
    const { user, isSignedIn } = useUser();
    const { isDark, toggleTheme } = useTheme();
    const { socket } = useSocket();
    const [businesses, setBusinesses] = useState([]);
    const [error, setError] = useState('');
    const [selectedKeyword, setSelectedKeyword] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [useAsyncSearch, setUseAsyncSearch] = useState(true);
    const [multiSearchMode, setMultiSearchMode] = useState(false);
    const [currentJobId, setCurrentJobId] = useState(null);
    const [activeJobs, setActiveJobs] = useState([]);
    const [viewMode, setViewMode] = useState('cards');
    const [filterRating, setFilterRating] = useState(0);
    const [sortBy, setSortBy] = useState('relevance');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [priceRange, setPriceRange] = useState('all');
    const [openNow, setOpenNow] = useState(false);
    const [showRecentSearches, setShowRecentSearches] = useState(false);
    const recentSearchesRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (recentSearchesRef.current && !recentSearchesRef.current.contains(event.target)) {
                setShowRecentSearches(false);
            }
        };

        if (showRecentSearches) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showRecentSearches]);

    // Socket event listeners for multi-search mode
    useEffect(() => {
        if (!socket || !multiSearchMode) return;

        const handleJobProgress = (data) => {
            setActiveJobs(prev =>
                prev.map(job =>
                    job.jobId === data.jobId
                        ? { ...job, progress: data.progress, status: 'processing' }
                        : job
                )
            );
        };

        const handleJobCompleted = (data) => {
            setActiveJobs(prev =>
                prev.map(job =>
                    job.jobId === data.jobId
                        ? { ...job, progress: 100, status: 'completed', businesses: data.data }
                        : job
                )
            );

            // If the completed job is the currently active tab, update businesses display
            if (data.jobId === currentJobId) {
                setBusinesses(data.data);
            }
        };

        const handleJobFailed = (data) => {
            setActiveJobs(prev =>
                prev.map(job =>
                    job.jobId === data.jobId
                        ? { ...job, status: 'failed', error: data.error }
                        : job
                )
            );
        };

        socket.on('job:progress', handleJobProgress);
        socket.on('job:completed', handleJobCompleted);
        socket.on('job:failed', handleJobFailed);

        return () => {
            socket.off('job:progress', handleJobProgress);
            socket.off('job:completed', handleJobCompleted);
            socket.off('job:failed', handleJobFailed);
        };
    }, [socket, multiSearchMode, currentJobId]);

    const stats = {
        total: businesses.length,
        avgRating: businesses.length > 0
            ? (businesses.reduce((sum, b) => sum + (b.rating || 0), 0) / businesses.length).toFixed(1)
            : 0,
        withEmail: businesses.filter(b => b.email && b.email !== 'N/A').length,
        withWebsite: businesses.filter(b => b.website && b.website !== 'N/A').length,
        withPhone: businesses.filter(b => b.phone && b.phone !== 'N/A').length,
        highlyRated: businesses.filter(b => (b.rating || 0) >= 4.5).length,
    };

    const handleSearch = async (keyword, location, token, refresh = false) => {
        try {
            setError('');
            setIsSearching(true);
            setSelectedKeyword(keyword);
            setSelectedLocation(location);

            if (useAsyncSearch) {
                const result = await createSearchJob(keyword, location, token, refresh);

                if (multiSearchMode) {
                    // Multi-search mode: Add to active jobs array and switch to it
                    const newJob = {
                        jobId: result.jobId,
                        keyword,
                        location,
                        status: 'queued',
                        progress: 0,
                        businesses: [],
                        timestamp: new Date()
                    };

                    setActiveJobs(prev => [...prev, newJob]);

                    // Switch to the new tab immediately
                    setCurrentJobId(result.jobId);

                    // Clear businesses since this is a new search
                    setBusinesses([]);
                } else {
                    // Single mode: Replace current job
                    setBusinesses([]);
                    setCurrentJobId(result.jobId);
                    setActiveJobs([]);
                }
            } else {
                const result = await searchBusinesses(keyword, location, token, refresh);
                setBusinesses(result.data);
                setCurrentJobId(null);
                setActiveJobs([]);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch businesses');
            if (!multiSearchMode) {
                setBusinesses([]);
            }
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Modern Navbar */}
            <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-2xl shadow-black/20">
                <div className="w-full px-6 lg:px-10">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-12">
                            {/* Logo */}
                            <div className="flex items-center gap-3 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                    <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
                                        LeadFinder
                                    </h1>
                                    <p className="text-xs text-slate-500 font-medium">AI-Powered Lead Generation</p>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="hidden md:flex items-center gap-2">
                                <button className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-white/10 border border-white/10">
                                    Dashboard
                                </button>
                                <button className="px-5 py-2.5 text-sm text-slate-400 rounded-xl hover:bg-white/5 hover:text-white transition-all">
                                    Analytics
                                </button>
                                <button className="px-5 py-2.5 text-sm text-slate-400 rounded-xl hover:bg-white/5 hover:text-white transition-all">
                                    Saved Lists
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                            >
                                {isDark ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>

                            {/* User Section */}
                            {isSignedIn ? (
                                <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-semibold text-white">
                                            {user?.firstName || 'User'}
                                        </p>
                                        <p className="text-xs text-slate-400">{user?.primaryEmailAddress?.emailAddress}</p>
                                    </div>
                                    <UserButton />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <SignInButton mode="modal">
                                        <button className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                            Sign In
                                        </button>
                                    </SignInButton>
                                    <SignUpButton mode="modal">
                                        <button className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all rounded-xl shadow-lg shadow-cyan-500/25">
                                            Get Started
                                        </button>
                                    </SignUpButton>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="w-full px-4 lg:px-10 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <h2 className="text-4xl font-black text-white mb-2">
                                Discover Quality Leads
                            </h2>
                            <p className="text-lg text-slate-400">
                                Find businesses with verified contact information and social profiles
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-xl">
                                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span className="text-sm font-semibold text-white">Live Updates</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                                <span className="text-xs font-medium text-slate-400">Search Mode:</span>
                                <div className="inline-flex bg-white/5 rounded-lg p-0.5">
                                    <button
                                        onClick={() => setUseAsyncSearch(false)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!useAsyncSearch
                                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                                            : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        Instant
                                    </button>
                                    <button
                                        onClick={() => setUseAsyncSearch(true)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${useAsyncSearch
                                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                                            : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        Background
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Multi-Search Mode Toggle */}
                <div className="mb-6">
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-black text-white mb-1">Search Mode</h3>
                                <p className="text-xs text-slate-400">
                                    {multiSearchMode
                                        ? '⚡ Run multiple searches simultaneously'
                                        : '🎯 One search at a time (simple mode)'}
                                </p>
                            </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                            onClick={() => setMultiSearchMode(!multiSearchMode)}
                            className={`relative w-16 h-8 rounded-full transition-all duration-300 ${multiSearchMode
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                : 'bg-white/10'
                                }`}
                        >
                            <div
                                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${multiSearchMode ? 'left-9' : 'left-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Mode Info Badge */}
                    {multiSearchMode && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                            <div className="flex items-center gap-2 text-sm">
                                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span className="text-purple-300 font-semibold">
                                    You can now run up to 5 searches at the same time!
                                </span>
                            </div>
                        </div>
                    )}
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
                        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-black text-white mb-1">{stats.total}</p>
                            <p className="text-sm text-slate-400 font-medium">Total Leads</p>
                        </div>

                        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-5 hover:border-amber-500/50 transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-black text-white mb-1">{stats.avgRating}</p>
                            <p className="text-sm text-slate-400 font-medium">Avg Rating</p>
                        </div>

                        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-5 hover:border-blue-500/50 transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-black text-white mb-1">{stats.withEmail}</p>
                            <p className="text-sm text-slate-400 font-medium">With Email</p>
                            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" style={{ width: `${(stats.withEmail / stats.total) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-5 hover:border-purple-500/50 transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-black text-white mb-1">{stats.withWebsite}</p>
                            <p className="text-sm text-slate-400 font-medium">With Website</p>
                            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${(stats.withWebsite / stats.total) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/50 transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-black text-white mb-1">{stats.withPhone}</p>
                            <p className="text-sm text-slate-400 font-medium">With Phone</p>
                            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all" style={{ width: `${(stats.withPhone / stats.total) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-5 hover:border-rose-500/50 transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-rose-500/20 to-red-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-black text-white mb-1">{stats.highlyRated}</p>
                            <p className="text-sm text-slate-400 font-medium">Top Rated</p>
                            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full transition-all" style={{ width: `${(stats.highlyRated / stats.total) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Jobs Panel - Single & Multi Mode */}
                {multiSearchMode ? (
                    /* Multi-Search Mode: Show Tabbed Interface */
                    activeJobs.length > 0 && (
                        <div className="mb-8">
                            {/* Tabs Header */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {activeJobs.map((job, index) => {
                                        const isActive = currentJobId === job.jobId;
                                        return (
                                            <button
                                                key={job.jobId}
                                                onClick={() => {
                                                    setCurrentJobId(job.jobId);
                                                    setSelectedKeyword(job.keyword);
                                                    setSelectedLocation(job.location);
                                                    if (job.businesses && job.businesses.length > 0) {
                                                        setBusinesses(job.businesses);
                                                    }
                                                }}
                                                className={`group relative flex items-center gap-3 px-6 py-4 rounded-2xl transition-all flex-shrink-0 ${isActive
                                                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20'
                                                    : 'bg-white/5 border-2 border-white/10 hover:border-purple-500/30 hover:bg-white/10'
                                                    }`}
                                            >
                                                {/* Tab Icon & Info */}
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive
                                                        ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30'
                                                        : 'bg-white/10'
                                                        }`}>
                                                        <span className="text-lg">
                                                            {job.status === 'completed' ? '✅' :
                                                                job.status === 'processing' ? '🔍' :
                                                                    job.status === 'failed' ? '❌' : '⏳'}
                                                        </span>
                                                    </div>
                                                    <div className="text-left">
                                                        <div className={`font-black text-sm mb-0.5 ${isActive ? 'text-white' : 'text-slate-300'
                                                            }`}>
                                                            {job.keyword}
                                                        </div>
                                                        <div className={`text-xs ${isActive ? 'text-purple-300' : 'text-slate-500'
                                                            }`}>
                                                            📍 {job.location}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Badge */}
                                                {job.status !== 'completed' && (
                                                    <div className={`px-3 py-1 rounded-full text-xs font-black ${isActive
                                                        ? 'bg-purple-500/30 text-purple-200'
                                                        : 'bg-white/10 text-slate-400'
                                                        }`}>
                                                        {job.progress || 0}%
                                                    </div>
                                                )}

                                                {/* Results Count Badge */}
                                                {job.status === 'completed' && job.businesses && job.businesses.length > 0 && (
                                                    <div className={`px-3 py-1 rounded-full text-xs font-black ${isActive
                                                        ? 'bg-emerald-500/30 text-emerald-200'
                                                        : 'bg-white/10 text-slate-400'
                                                        }`}>
                                                        {job.businesses.length} leads
                                                    </div>
                                                )}

                                                {/* Close Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const removedJobId = job.jobId;
                                                        setActiveJobs(prev => {
                                                            const newJobs = prev.filter(j => j.jobId !== removedJobId);
                                                            // If we're closing the active tab, switch to another tab
                                                            if (currentJobId === removedJobId && newJobs.length > 0) {
                                                                setCurrentJobId(newJobs[0].jobId);
                                                                setSelectedKeyword(newJobs[0].keyword);
                                                                setSelectedLocation(newJobs[0].location);
                                                                if (newJobs[0].businesses) {
                                                                    setBusinesses(newJobs[0].businesses);
                                                                }
                                                            } else if (newJobs.length === 0) {
                                                                setCurrentJobId(null);
                                                                setBusinesses([]);
                                                            }
                                                            return newJobs;
                                                        });
                                                    }}
                                                    className={`p-2 rounded-lg transition-all hover:bg-red-500/20 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                        }`}
                                                >
                                                    <svg className="w-4 h-4 text-slate-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>

                                                {/* Active Tab Indicator */}
                                                {isActive && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Active Tab Info Bar */}
                                {currentJobId && (() => {
                                    const activeJob = activeJobs.find(j => j.jobId === currentJobId);
                                    if (!activeJob) return null;

                                    return (
                                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                                                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-white">
                                                            {activeJob.keyword} • {activeJob.location}
                                                        </h3>
                                                        <p className="text-sm text-purple-300 font-medium">
                                                            {activeJob.status === 'completed' && `✅ Found ${activeJob.businesses?.length || 0} businesses`}
                                                            {activeJob.status === 'processing' && `🔍 Scanning... ${activeJob.progress || 0}% complete`}
                                                            {activeJob.status === 'queued' && '⏳ Waiting in queue...'}
                                                            {activeJob.status === 'failed' && '❌ Search failed'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Progress Bar for Active Job */}
                                                {activeJob.status !== 'completed' && (
                                                    <div className="w-48">
                                                        <div className="relative h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 relative overflow-hidden"
                                                                style={{ width: `${activeJob.progress || 0}%` }}
                                                            >
                                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Show JobStatus component for active job if it's still processing */}
                            {currentJobId && (() => {
                                const activeJob = activeJobs.find(j => j.jobId === currentJobId);
                                if (activeJob && activeJob.status !== 'completed') {
                                    return (
                                        <div className="mb-6">
                                            <JobStatus
                                                jobId={currentJobId}
                                                onComplete={(data) => {
                                                    // Update the specific job with results
                                                    setActiveJobs(prev =>
                                                        prev.map(job =>
                                                            job.jobId === currentJobId
                                                                ? { ...job, status: 'completed', progress: 100, businesses: data }
                                                                : job
                                                        )
                                                    );
                                                    setBusinesses(data);
                                                    setIsSearching(false);
                                                }}
                                            />
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    )
                ) : (
                    /* Single Mode: Show Only Current Job */
                    currentJobId && (
                        <div className="mb-8">
                            <JobStatus jobId={currentJobId} onComplete={handleJobComplete} />
                        </div>
                    )
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-8 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-red-300 mb-1">Search Error</p>
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls Bar */}
                {businesses.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-xl">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {/* View Mode Toggle */}
                            <div className="inline-flex bg-white/5 border border-white/10 rounded-xl p-1">
                                {[
                                    { mode: 'cards', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                                    { mode: 'table', icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                                    { mode: 'map', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' }
                                ].map(({ mode, icon }) => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={`px-5 py-3 text-sm font-bold capitalize rounded-lg transition-all flex items-center gap-2 ${viewMode === mode
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                                        </svg>
                                        {mode}
                                    </button>
                                ))}
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-3">
                                {/* Recent Searches */}
                                <div className="relative" ref={recentSearchesRef}>
                                    <button
                                        onClick={() => setShowRecentSearches(!showRecentSearches)}
                                        className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-300 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/5 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Recent
                                        <svg className={`w-4 h-4 transition-transform ${showRecentSearches ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showRecentSearches && (
                                        <div className="absolute right-0 mt-2 w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                                            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Recent Searches
                                                </h3>
                                            </div>
                                            <div className="p-3 max-h-96 overflow-y-auto">
                                                <SearchHistory onSelectHistory={(keyword, location) => {
                                                    handleSelectHistory(keyword, location);
                                                    setShowRecentSearches(false);
                                                }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <select
                                    value={filterRating}
                                    onChange={(e) => setFilterRating(Number(e.target.value))}
                                    className="px-4 py-3 text-sm font-semibold border border-white/10 rounded-xl bg-white/5 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                                >
                                    <option value={0}>All Ratings</option>
                                    <option value={3.5}>3.5+ Stars</option>
                                    <option value={4}>4.0+ Stars</option>
                                    <option value={4.5}>4.5+ Stars</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-3 text-sm font-semibold border border-white/10 rounded-xl bg-white/5 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                                >
                                    <option value="relevance">Sort: Relevance</option>
                                    <option value="rating">Sort: Rating</option>
                                    <option value="reviews">Sort: Reviews</option>
                                    <option value="distance">Sort: Distance</option>
                                </select>

                                <button
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className="px-5 py-3 text-sm font-semibold text-slate-300 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/5 transition-all"
                                >
                                    {showAdvancedFilters ? 'Less Filters' : 'More Filters'}
                                </button>

                                <ExportButtons businesses={filteredBusinesses} />
                            </div>
                        </div>

                        {/* Advanced Filters Panel */}
                        {showAdvancedFilters && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 mb-3">
                                            Price Range
                                        </label>
                                        <select
                                            value={priceRange}
                                            onChange={(e) => setPriceRange(e.target.value)}
                                            className="w-full px-4 py-3 text-sm font-semibold border border-white/10 rounded-xl bg-white/5 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                                        >
                                            <option value="all">All Prices</option>
                                            <option value="$">$ (Budget)</option>
                                            <option value="$$">$$ (Moderate)</option>
                                            <option value="$$$">$$$ (Expensive)</option>
                                            <option value="$$$$">$$$$ (Luxury)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 mb-3">
                                            Business Status
                                        </label>
                                        <label className="flex items-center gap-3 px-4 py-3 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-all bg-white/5">
                                            <input
                                                type="checkbox"
                                                checked={openNow}
                                                onChange={(e) => setOpenNow(e.target.checked)}
                                                className="w-5 h-5 rounded-lg border-white/20 text-cyan-500 focus:ring-cyan-500 bg-white/5"
                                            />
                                            <span className="text-sm font-semibold text-white">Open Now Only</span>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 mb-3">
                                            Results Showing
                                        </label>
                                        <div className="px-4 py-3 border border-white/10 rounded-xl bg-white/5">
                                            <span className="text-sm font-bold text-white">
                                                {filteredBusinesses.length} of {businesses.length} leads
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Content Area */}
                {businesses.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Business Cards/Table */}
                        <div className="xl:col-span-2">
                            {viewMode === 'table' ? (
                                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                                    <div className="p-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                                        <h3 className="text-xl font-black text-white">
                                            {filteredBusinesses.length} Leads Found
                                        </h3>
                                        {selectedKeyword && selectedLocation && (
                                            <p className="text-sm text-slate-400 mt-1">
                                                {selectedKeyword} • {selectedLocation}
                                            </p>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <BusinessTable businesses={filteredBusinesses} />
                                    </div>
                                </div>
                            ) : viewMode === 'map' ? (
                                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                                    <div className="p-6 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                                            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                            Map View
                                        </h3>
                                    </div>
                                    <div className="h-[700px]">
                                        <BusinessMap businesses={filteredBusinesses} />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredBusinesses.map((business, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedBusiness(business)}
                                            className="group relative bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer backdrop-blur-xl"
                                        >
                                            {/* Animated Border */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>

                                            {/* Content */}
                                            <div className="relative">
                                                {/* Image Banner */}
                                                <div className="relative w-full h-56 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                                                    {business.photoUrl ? (
                                                        <img
                                                            src={business.photoUrl}
                                                            alt={business.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <div className="text-center">
                                                                <div className="text-7xl mb-3">🏢</div>
                                                                <p className="text-sm text-slate-500 font-medium">No image available</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Status Badge */}
                                                    {business.isOpenNow !== undefined && (
                                                        <div className="absolute top-4 right-4">
                                                            <span className={`px-4 py-2 text-xs font-black uppercase rounded-full backdrop-blur-xl shadow-lg ${business.isOpenNow
                                                                ? 'bg-emerald-500/90 text-white border border-emerald-400/50'
                                                                : 'bg-red-500/90 text-white border border-red-400/50'
                                                                }`}>
                                                                {business.isOpenNow ? '● Open' : '● Closed'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Rating Badge */}
                                                    {business.rating && (
                                                        <div className="absolute bottom-4 left-4">
                                                            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xl px-4 py-2 rounded-full shadow-xl border border-white/20">
                                                                <span className="text-xl">⭐</span>
                                                                <span className="text-base font-black text-slate-900">
                                                                    {business.rating}
                                                                </span>
                                                                {business.reviewCount && (
                                                                    <span className="text-sm text-slate-600 font-semibold">
                                                                        ({business.reviewCount})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Card Content */}
                                                <div className="p-6">
                                                    {/* Business Name */}
                                                    <div className="flex items-start justify-between mb-4">
                                                        <h4 className="font-black text-2xl text-white line-clamp-1 flex-1">
                                                            {business.name}
                                                        </h4>
                                                        {business.verified && (
                                                            <span className="ml-2 text-cyan-400 flex-shrink-0">
                                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Category & Price */}
                                                    <div className="flex items-center gap-2 mb-5">
                                                        {business.category && (
                                                            <span className="px-3 py-1.5 text-xs font-black bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30">
                                                                {business.category}
                                                            </span>
                                                        )}
                                                        {business.priceLevel && (
                                                            <span className="px-3 py-1.5 text-xs font-black bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                                                                {business.priceLevel}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Contact Grid */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                                        {business.phone && business.phone !== 'N/A' && (
                                                            <a
                                                                href={`tel:${business.phone}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all group/link"
                                                            >
                                                                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover/link:scale-110 transition-transform">
                                                                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-sm font-bold text-white truncate">{business.phone}</span>
                                                            </a>
                                                        )}

                                                        {business.email && business.email !== 'N/A' && (
                                                            <a
                                                                href={`mailto:${business.email.split(',')[0]}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group/link"
                                                            >
                                                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover/link:scale-110 transition-transform">
                                                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-sm font-bold text-white truncate">{business.email.split(',')[0]}</span>
                                                            </a>
                                                        )}

                                                        {business.website && business.website !== 'N/A' && (
                                                            <a
                                                                href={business.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all group/link sm:col-span-2"
                                                            >
                                                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover/link:scale-110 transition-transform">
                                                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-sm font-bold text-white truncate flex-1">Visit Website</span>
                                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                </svg>
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* Address */}
                                                    {business.address && (
                                                        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-5">
                                                            <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span className="text-sm text-slate-300">{business.address}</span>
                                                        </div>
                                                    )}

                                                    {/* Social Links */}
                                                    {(business.facebookUrl || business.instagramUrl || business.linkedinUrl || business.twitterUrl) && (
                                                        <div className="pt-5 border-t border-white/10">
                                                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Connect</p>
                                                            <div className="flex gap-2">
                                                                {business.facebookUrl && business.facebookUrl !== 'N/A' && (
                                                                    <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 hover:scale-110 transition-all">
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                                                    </a>
                                                                )}
                                                                {business.instagramUrl && business.instagramUrl !== 'N/A' && (
                                                                    <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-11 h-11 flex items-center justify-center rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30 hover:scale-110 transition-all">
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                                                    </a>
                                                                )}
                                                                {business.linkedinUrl && business.linkedinUrl !== 'N/A' && (
                                                                    <a href={business.linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 hover:scale-110 transition-all">
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                                                    </a>
                                                                )}
                                                                {business.twitterUrl && business.twitterUrl !== 'N/A' && (
                                                                    <a href={business.twitterUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-11 h-11 flex items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 hover:scale-110 transition-all">
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Deep Scan Button */}
                                                    {business.website && business.website !== 'N/A' && (
                                                        <div className="mt-5 pt-5 border-t border-white/10">
                                                            <DeepScanButton
                                                                business={business}
                                                                onScanComplete={(updatedBusiness, scanResults) => {
                                                                    // Update the business in the list
                                                                    const updatedBusinesses = businesses.map(b =>
                                                                        b._id === updatedBusiness._id ? updatedBusiness : b
                                                                    );
                                                                    setBusinesses(updatedBusinesses);
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Map or Info */}
                        <div className="xl:col-span-1">
                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl sticky top-24">
                                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        Location Map
                                    </h3>
                                </div>
                                <div className="h-[600px]">
                                    <BusinessMap businesses={filteredBusinesses} />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : !error && !currentJobId && !isSearching ? (
                    <div className="border-2 border-dashed border-white/10 bg-gradient-to-br from-white/5 to-transparent rounded-3xl p-24 text-center backdrop-blur-xl">
                        <div className="relative inline-block mb-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl blur-2xl opacity-50"></div>
                            <div className="relative w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mx-auto flex items-center justify-center text-6xl shadow-2xl">
                                🚀
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-white mb-4">
                            Start Your Lead Discovery
                        </h3>
                        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                            Enter a business type and location to find verified leads with complete contact information
                        </p>
                        <div className="flex items-center justify-center gap-6 text-base">
                            {[
                                { icon: '📧', label: 'Email Addresses' },
                                { icon: '📞', label: 'Phone Numbers' },
                                { icon: '🌐', label: 'Websites' },
                                { icon: '📱', label: 'Social Media' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-slate-400">
                                    <span className="text-2xl">{item.icon}</span>
                                    <span className="font-semibold">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Business Detail Modal */}
            {selectedBusiness && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
                    onClick={() => setSelectedBusiness(null)}
                >
                    <div
                        className="bg-gradient-to-br from-slate-900 to-slate-950 max-w-3xl w-full max-h-[90vh] overflow-hidden border border-white/10 rounded-3xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Image */}
                        <div className="relative h-72 bg-gradient-to-br from-slate-800 to-slate-900">
                            {selectedBusiness.photoUrl ? (
                                <img
                                    src={selectedBusiness.photoUrl}
                                    alt={selectedBusiness.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-9xl">🏢</div>
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedBusiness(null)}
                                className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-white/20 transition-all"
                            >
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[calc(90vh-18rem)] p-8">
                            {/* Title Section */}
                            <div className="flex items-start justify-between mb-8 pb-8 border-b border-white/10">
                                <div className="flex-1">
                                    <h2 className="text-4xl font-black text-white mb-3">
                                        {selectedBusiness.name}
                                    </h2>
                                    {selectedBusiness.category && (
                                        <span className="inline-block px-4 py-2 text-sm font-black bg-cyan-500/20 text-cyan-300 rounded-xl border border-cyan-500/30">
                                            {selectedBusiness.category}
                                        </span>
                                    )}
                                </div>
                                {selectedBusiness.rating && (
                                    <div className="text-right ml-6">
                                        <div className="text-5xl font-black text-white mb-1">
                                            {selectedBusiness.rating}
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        {selectedBusiness.reviewCount && (
                                            <div className="text-sm text-slate-400 mt-1 font-semibold">
                                                {selectedBusiness.reviewCount} reviews
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-6">
                                {selectedBusiness.address && (
                                    <div>
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Location</p>
                                        <p className="text-lg text-white font-semibold">{selectedBusiness.address}</p>
                                    </div>
                                )}

                                {selectedBusiness.phone && selectedBusiness.phone !== 'N/A' && (
                                    <div>
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Phone</p>
                                        <a href={`tel:${selectedBusiness.phone}`} className="text-lg text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                                            {selectedBusiness.phone}
                                        </a>
                                    </div>
                                )}

                                {selectedBusiness.email && selectedBusiness.email !== 'N/A' && (
                                    <div>
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Email</p>
                                        <a href={`mailto:${selectedBusiness.email}`} className="text-lg text-cyan-400 hover:text-cyan-300 font-semibold break-all transition-colors">
                                            {selectedBusiness.email}
                                        </a>
                                    </div>
                                )}

                                {selectedBusiness.website && selectedBusiness.website !== 'N/A' && (
                                    <div>
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Website</p>
                                        <a
                                            href={selectedBusiness.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-lg text-cyan-400 hover:text-cyan-300 font-semibold break-all transition-colors"
                                        >
                                            {selectedBusiness.website}
                                        </a>
                                    </div>
                                )}

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-4 pt-6">
                                    {selectedBusiness.priceLevel && (
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Price Level</p>
                                            <p className="text-2xl font-black text-white">{selectedBusiness.priceLevel}</p>
                                        </div>
                                    )}

                                    {selectedBusiness.isOpenNow !== undefined && (
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Status</p>
                                            <span className={`inline-block px-3 py-1.5 text-sm font-black rounded-lg ${selectedBusiness.isOpenNow
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                }`}>
                                                {selectedBusiness.isOpenNow ? 'Open Now' : 'Closed'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 pt-8 border-t border-white/10 flex gap-4">
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBusiness.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-center font-black rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25"
                                >
                                    Get Directions
                                </a>
                                <button className="flex-1 px-6 py-4 border-2 border-white/20 text-white font-black rounded-xl hover:bg-white/5 transition-all">
                                    Save Lead
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