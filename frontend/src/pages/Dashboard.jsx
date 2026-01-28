// // import { useState } from 'react';
// // import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/clerk-react';
// // import { useTheme } from '../context/ThemeContext';
// // import SearchForm from '../components/SearchForm';
// // import SearchHistory from '../components/SearchHistory';
// // import BusinessTable from '../components/BusinessTable';
// // import BusinessMap from '../components/BusinessMap';
// // import ExportButtons from '../components/ExportButtons';
// // import JobStatus from '../components/JobStatus';
// // import { searchBusinesses, createSearchJob } from '../api/business.api';

// // const Dashboard = () => {
// //     const { user, isSignedIn } = useUser();
// //     const { isDark, toggleTheme } = useTheme();
// //     const [businesses, setBusinesses] = useState([]);
// //     const [error, setError] = useState('');
// //     const [selectedKeyword, setSelectedKeyword] = useState('');
// //     const [selectedLocation, setSelectedLocation] = useState('');
// //     const [useAsyncSearch, setUseAsyncSearch] = useState(true);
// //     const [currentJobId, setCurrentJobId] = useState(null);

// //     const handleSearch = async (keyword, location, token) => {
// //         try {
// //             setError('');
// //             setBusinesses([]);
// //             setCurrentJobId(null);

// //             if (useAsyncSearch) {
// //                 const result = await createSearchJob(keyword, location, token);
// //                 setCurrentJobId(result.jobId);
// //             } else {
// //                 const result = await searchBusinesses(keyword, location, token);
// //                 setBusinesses(result.data);
// //             }
// //         } catch (err) {
// //             setError(err.response?.data?.message || 'Failed to fetch businesses');
// //             setBusinesses([]);
// //         }
// //     };

// //     const handleJobComplete = (data) => {
// //         setBusinesses(data);
// //         setCurrentJobId(null);
// //     };

// //     const handleSelectHistory = (keyword, location) => {
// //         setSelectedKeyword(keyword);
// //         setSelectedLocation(location);
// //     };

// //     return (
// //         <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
// //             <header className="glass-effect border-b border-white/20 dark:border-gray-700 sticky top-0 z-50 dark:bg-gray-800/90">
// //                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
// //                     <div className="flex justify-between items-center">
// //                         <div>
// //                             <h1 className="text-3xl font-bold gradient-text mb-1">
// //                                 Business Lead Generator
// //                             </h1>
// //                             {isSignedIn ? (
// //                                 <p className="text-sm text-gray-600 dark:text-gray-400">
// //                                     Welcome back, <span className="font-semibold text-purple-600 dark:text-purple-400">{user?.firstName || user?.emailAddresses[0]?.emailAddress}</span>
// //                                 </p>
// //                             ) : (
// //                                 <p className="text-sm text-gray-600 dark:text-gray-400">
// //                                     Discover businesses on Google Maps
// //                                 </p>
// //                             )}
// //                         </div>
// //                         <div className="flex items-center gap-3">
// //                             <button
// //                                 onClick={toggleTheme}
// //                                 className="p-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
// //                                 aria-label="Toggle theme"
// //                             >
// //                                 {isDark ? (
// //                                     <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
// //                                     </svg>
// //                                 ) : (
// //                                     <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
// //                                     </svg>
// //                                 )}
// //                             </button>
// //                             {isSignedIn ? (
// //                                 <UserButton afterSignOutUrl="/" />
// //                             ) : (
// //                                 <>
// //                                     <SignInButton mode="modal">
// //                                         <button className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
// //                                             Sign In
// //                                         </button>
// //                                     </SignInButton>
// //                                     <SignUpButton mode="modal">
// //                                         <button className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">
// //                                             Get Started
// //                                         </button>
// //                                     </SignUpButton>
// //                                 </>
// //                             )}
// //                         </div>
// //                     </div>
// //                 </div>
// //             </header>

// //             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
// //                 {/* Hero section */}
// //                 <div className="text-center mb-8">
// //                     <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
// //                         Find Your Next
// //                         <span className="block bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
// //                             Business Lead
// //                         </span>
// //                     </h2>
// //                     <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
// //                         Search and export business data from Google Maps with AI-powered autocomplete
// //                     </p>

// //                     <div className="flex items-center justify-center gap-3">
// //                         <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Search Mode:</span>
// //                         <button
// //                             onClick={() => setUseAsyncSearch(!useAsyncSearch)}
// //                             className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${useAsyncSearch
// //                                 ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
// //                                 : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
// //                                 }`}
// //                         >
// //                             {useAsyncSearch ? '⚙️ Background Job' : '⚡ Instant'}
// //                         </button>
// //                     </div>
// //                 </div>

// //                 <SearchHistory onSelectHistory={handleSelectHistory} />

// //                 <SearchForm
// //                     onSearch={handleSearch}
// //                     initialKeyword={selectedKeyword}
// //                     initialLocation={selectedLocation}
// //                 />

// //                 {currentJobId && (
// //                     <JobStatus jobId={currentJobId} onComplete={handleJobComplete} />
// //                 )}

// //                 {error && (
// //                     <div className="glass-effect border border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl mb-6">
// //                         <div className="flex items-center gap-2">
// //                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
// //                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
// //                             </svg>
// //                             <span className="font-medium">{error}</span>
// //                         </div>
// //                     </div>
// //                 )}

// //                 {businesses.length > 0 && (
// //                     <div className="space-y-6">
// //                         <div className="glass-effect dark:bg-gray-800/90 rounded-xl p-4 flex justify-between items-center">
// //                             <div className="flex items-center gap-2">
// //                                 <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
// //                                 </svg>
// //                                 <span className="text-gray-700 dark:text-gray-300">
// //                                     Found <span className="font-bold text-purple-600 dark:text-purple-400 text-xl">{businesses.length}</span> businesses
// //                                 </span>
// //                             </div>
// //                             <ExportButtons businesses={businesses} />
// //                         </div>
// //                         <BusinessMap businesses={businesses} />
// //                         <BusinessTable businesses={businesses} />
// //                     </div>
// //                 )}

// //                 {businesses.length === 0 && !error && !currentJobId && (
// //                     <div className="glass-effect dark:bg-gray-800/90 rounded-xl p-12 text-center">
// //                         <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
// //                         </svg>
// //                         <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Ready to find businesses?</h3>
// //                         <p className="text-gray-500 dark:text-gray-400">
// //                             Enter a keyword and location above to get started
// //                         </p>
// //                     </div>
// //                 )}
// //             </div>
// //         </div>
// //     );
// // };

// // export default Dashboard;


// import { useState } from 'react';
// import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/clerk-react';
// import { useTheme } from '../context/ThemeContext';
// import SearchForm from '../components/SearchForm';
// import SearchHistory from '../components/SearchHistory';
// import BusinessTable from '../components/BusinessTable';
// import BusinessMap from '../components/BusinessMap';
// import ExportButtons from '../components/ExportButtons';
// import JobStatus from '../components/JobStatus';
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

//     // Stats calculation
//     const stats = {
//         total: businesses.length,
//         avgRating: businesses.length > 0
//             ? (businesses.reduce((sum, b) => sum + (b.rating || 0), 0) / businesses.length).toFixed(1)
//             : 0,
//         withWebsite: businesses.filter(b => b.website).length,
//         withPhone: businesses.filter(b => b.phone).length,
//     };

//     const handleSearch = async (keyword, location, token) => {
//         try {
//             setError('');
//             setBusinesses([]);
//             setCurrentJobId(null);
//             setIsSearching(true);

//             if (useAsyncSearch) {
//                 const result = await createSearchJob(keyword, location, token);
//                 setCurrentJobId(result.jobId);
//             } else {
//                 const result = await searchBusinesses(keyword, location, token);
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
//         .sort((a, b) => {
//             if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
//             if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
//             return 0;
//         });

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950">

//             {/* Animated Background Elements */}
//             <div className="fixed inset-0 overflow-hidden pointer-events-none">
//                 <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
//                 <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
//                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
//             </div>

//             {/* Enhanced Navbar with Glassmorphism */}
//             <nav className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-xl">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="flex justify-between items-center h-20">
//                         {/* Logo Section */}
//                         <div className="flex items-center space-x-4">
//                             <div className="relative group">
//                                 <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
//                                 <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
//                                     <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                                     </svg>
//                                 </div>
//                             </div>
//                             <div>
//                                 <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
//                                     LeadFinder AI
//                                 </h1>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Powered by Google Maps</p>
//                             </div>
//                         </div>

//                         {/* Right Section */}
//                         <div className="flex items-center space-x-4">
//                             {/* Theme Toggle */}
//                             <button
//                                 onClick={toggleTheme}
//                                 className="relative p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:shadow-lg transition-all duration-300 group"
//                                 aria-label="Toggle theme"
//                             >
//                                 {isDark ? (
//                                     <svg className="w-5 h-5 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
//                                         <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
//                                     </svg>
//                                 ) : (
//                                     <svg className="w-5 h-5 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
//                                         <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
//                                     </svg>
//                                 )}
//                             </button>

//                             {/* User Section */}
//                             {isSignedIn ? (
//                                 <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-800">
//                                     <div className="hidden md:block text-right">
//                                         <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                                             {user?.firstName || 'User'}
//                                         </p>
//                                         <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Premium Member</p>
//                                     </div>
//                                     <UserButton
//                                         appearance={{
//                                             elements: {
//                                                 avatarBox: 'w-10 h-10 ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900 shadow-lg'
//                                             }
//                                         }}
//                                     />
//                                 </div>
//                             ) : (
//                                 <div className="flex items-center space-x-3">
//                                     <SignInButton mode="modal">
//                                         <button className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
//                                             Sign In
//                                         </button>
//                                     </SignInButton>
//                                     <SignUpButton mode="modal">
//                                         <button className="relative px-6 py-2.5 text-sm font-semibold text-white rounded-xl overflow-hidden group">
//                                             <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 transition-transform duration-300 group-hover:scale-105"></div>
//                                             <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
//                                             <span className="relative">Get Started Free</span>
//                                         </button>
//                                     </SignUpButton>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </nav>

//             <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

//                 {/* Hero Section with Animation */}
//                 <div className="text-center mb-16 animate-fade-in">
//                     <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full mb-6 border border-purple-200 dark:border-purple-800 shadow-lg">
//                         <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
//                             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                         </svg>
//                         <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
//                             AI-Powered Business Intelligence
//                         </span>
//                     </div>

//                     <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
//                         Discover Your Next
//                         <br />
//                         <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
//                             Million Dollar Lead
//                         </span>
//                     </h2>

//                     <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
//                         Extract valuable business data from Google Maps with intelligent autocomplete,
//                         <span className="font-semibold text-indigo-600 dark:text-indigo-400"> real-time insights</span>, and
//                         <span className="font-semibold text-purple-600 dark:text-purple-400"> instant exports</span>
//                     </p>
//                 </div>

//                 {/* Search Mode Toggle - More Prominent */}
//                 <div className="flex justify-center mb-10">
//                     <div className="inline-flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
//                         <span className="text-sm font-bold text-gray-700 dark:text-gray-300 px-4">
//                             Search Mode
//                         </span>
//                         <div className="flex space-x-2">
//                             <button
//                                 onClick={() => setUseAsyncSearch(false)}
//                                 className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform ${!useAsyncSearch
//                                     ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105'
//                                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
//                                     }`}
//                             >
//                                 <span className="mr-2">⚡</span>
//                                 Instant Search
//                             </button>
//                             <button
//                                 onClick={() => setUseAsyncSearch(true)}
//                                 className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform ${useAsyncSearch
//                                     ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105'
//                                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
//                                     }`}
//                             >
//                                 <span className="mr-2">⚙️</span>
//                                 Background Job
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Search Form */}
//                 <div className="mb-12">
//                     <SearchForm
//                         onSearch={handleSearch}
//                         initialKeyword={selectedKeyword}
//                         initialLocation={selectedLocation}
//                     />
//                 </div>

//                 {/* Stats Dashboard - Premium Cards */}
//                 {businesses.length > 0 && (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//                         {[
//                             {
//                                 label: 'Total Businesses',
//                                 value: stats.total,
//                                 icon: '🏢',
//                                 gradient: 'from-purple-500 to-indigo-600',
//                                 bgGradient: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20'
//                             },
//                             {
//                                 label: 'Average Rating',
//                                 value: `${stats.avgRating}⭐`,
//                                 icon: '📊',
//                                 gradient: 'from-yellow-500 to-orange-600',
//                                 bgGradient: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
//                             },
//                             {
//                                 label: 'With Website',
//                                 value: stats.withWebsite,
//                                 icon: '🌐',
//                                 gradient: 'from-blue-500 to-cyan-600',
//                                 bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
//                             },
//                             {
//                                 label: 'With Phone',
//                                 value: stats.withPhone,
//                                 icon: '📱',
//                                 gradient: 'from-green-500 to-emerald-600',
//                                 bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
//                             }
//                         ].map((stat, idx) => (
//                             <div
//                                 key={idx}
//                                 className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300`}
//                             >
//                                 <div className="flex items-center justify-between mb-4">
//                                     <span className="text-4xl">{stat.icon}</span>
//                                     <div className={`px-3 py-1 bg-gradient-to-r ${stat.gradient} rounded-full`}>
//                                         <span className="text-xs font-bold text-white">Live</span>
//                                     </div>
//                                 </div>
//                                 <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">{stat.label}</p>
//                                 <p className="text-4xl font-black text-gray-900 dark:text-white">{stat.value}</p>
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 {/* Job Status */}
//                 {currentJobId && (
//                     <div className="mb-8">
//                         <JobStatus jobId={currentJobId} onComplete={handleJobComplete} />
//                     </div>
//                 )}

//                 {/* Error Message - Enhanced */}
//                 {error && (
//                     <div className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-300 dark:border-red-800 rounded-2xl p-6 shadow-lg">
//                         <div className="flex items-center space-x-4">
//                             <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
//                                 <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
//                                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                                 </svg>
//                             </div>
//                             <div>
//                                 <h4 className="text-lg font-bold text-red-900 dark:text-red-200 mb-1">Oops! Something went wrong</h4>
//                                 <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Controls Bar - Premium Design */}
//                 {businesses.length > 0 && (
//                     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 mb-8">
//                         <div className="flex flex-wrap items-center justify-between gap-6">

//                             {/* View Mode */}
//                             <div className="flex items-center space-x-3">
//                                 <span className="text-sm font-bold text-gray-700 dark:text-gray-300">View Mode:</span>
//                                 <div className="inline-flex rounded-xl border-2 border-gray-300 dark:border-gray-600 overflow-hidden shadow-lg">
//                                     {['table', 'map', 'grid'].map((mode) => (
//                                         <button
//                                             key={mode}
//                                             onClick={() => setViewMode(mode)}
//                                             className={`px-5 py-2.5 text-sm font-bold capitalize transition-all duration-300 ${viewMode === mode
//                                                 ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
//                                                 : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                                                 }`}
//                                         >
//                                             {mode === 'table' && '📋'}
//                                             {mode === 'map' && '🗺️'}
//                                             {mode === 'grid' && '📱'}
//                                             <span className="ml-2">{mode}</span>
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Filters */}
//                             <div className="flex items-center space-x-4">
//                                 <div className="flex items-center space-x-2">
//                                     <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Filter:</span>
//                                     <select
//                                         value={filterRating}
//                                         onChange={(e) => setFilterRating(Number(e.target.value))}
//                                         className="px-4 py-2.5 text-sm font-medium border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500 focus:border-purple-500 shadow-lg transition-all"
//                                     >
//                                         <option value={0}>All Ratings ⭐</option>
//                                         <option value={4}>4+ Stars ⭐⭐⭐⭐</option>
//                                         <option value={4.5}>4.5+ Stars ⭐⭐⭐⭐⭐</option>
//                                     </select>
//                                 </div>

//                                 <div className="flex items-center space-x-2">
//                                     <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Sort:</span>
//                                     <select
//                                         value={sortBy}
//                                         onChange={(e) => setSortBy(e.target.value)}
//                                         className="px-4 py-2.5 text-sm font-medium border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500 focus:border-purple-500 shadow-lg transition-all"
//                                     >
//                                         <option value="relevance">🎯 Relevance</option>
//                                         <option value="rating">⭐ Highest Rated</option>
//                                         <option value="reviews">💬 Most Reviews</option>
//                                     </select>
//                                 </div>

//                                 <ExportButtons businesses={filteredBusinesses} />
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Main Content Grid */}
//                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

//                     {/* Sidebar - Search History */}
//                     <div className="lg:col-span-1">
//                         <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-28">
//                             <div className="flex items-center space-x-3 mb-6">
//                                 <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
//                                     <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                     </svg>
//                                 </div>
//                                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Searches</h3>
//                             </div>
//                             <SearchHistory onSelect={handleSelectHistory} />
//                         </div>
//                     </div>

//                     {/* Results Area */}
//                     <div className="lg:col-span-3">
//                         {businesses.length > 0 ? (
//                             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//                                 <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
//                                     <h3 className="text-2xl font-black text-white flex items-center">
//                                         <svg className="w-7 h-7 mr-3" fill="currentColor" viewBox="0 0 20 20">
//                                             <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
//                                             <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
//                                         </svg>
//                                         Found {filteredBusinesses.length} businesses
//                                         {filterRating > 0 && ` with ${filterRating}+ stars`}
//                                     </h3>
//                                     <p className="text-purple-100 mt-2">Click to view details, export, or analyze</p>
//                                 </div>

//                                 <div className="p-6">
//                                     {viewMode === 'table' && <BusinessTable businesses={filteredBusinesses} />}
//                                     {viewMode === 'map' && <BusinessMap businesses={filteredBusinesses} />}
//                                     {viewMode === 'grid' && (
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                             {filteredBusinesses.map((business, index) => (
//                                                 <div
//                                                     key={index}
//                                                     className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-6 hover:shadow-2xl hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1"
//                                                 >
//                                                     <div className="flex items-start justify-between mb-4">
//                                                         <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
//                                                             {business.name}
//                                                         </h4>
//                                                         <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
//                                                             <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
//                                                                 <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                                                             </svg>
//                                                         </div>
//                                                     </div>

//                                                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-start">
//                                                         <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                                                             <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                                                         </svg>
//                                                         {business.address}
//                                                     </p>

//                                                     {business.rating && (
//                                                         <div className="flex items-center space-x-2 mb-3 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
//                                                             <span className="text-yellow-500 text-lg">⭐</span>
//                                                             <span className="text-sm font-bold text-gray-900 dark:text-white">{business.rating}</span>
//                                                             {business.reviewCount && (
//                                                                 <span className="text-xs text-gray-500 dark:text-gray-400">
//                                                                     ({business.reviewCount} reviews)
//                                                                 </span>
//                                                             )}
//                                                         </div>
//                                                     )}

//                                                     <div className="space-y-2">
//                                                         {business.phone && (
//                                                             <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
//                                                                 <span className="mr-2">📞</span>
//                                                                 <a href={`tel:${business.phone}`} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
//                                                                     {business.phone}
//                                                                 </a>
//                                                             </p>
//                                                         )}
//                                                         {business.website && (
//                                                             <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
//                                                                 <span className="mr-2">🌐</span>
//                                                                 <a
//                                                                     href={business.website}
//                                                                     target="_blank"
//                                                                     rel="noopener noreferrer"
//                                                                     className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate"
//                                                                 >
//                                                                     Visit Website
//                                                                 </a>
//                                                             </p>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         ) : !error && !currentJobId && !isSearching ? (
//                             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-16 text-center">
//                                 <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
//                                     <svg className="w-16 h-16 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                                     </svg>
//                                 </div>
//                                 <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
//                                     Ready to Find Businesses?
//                                 </h3>
//                                 <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
//                                     Enter a keyword and location above to discover amazing businesses with our AI-powered search engine
//                                 </p>
//                                 <div className="flex justify-center space-x-4">
//                                     <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
//                                         <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">🎯 Accurate Results</span>
//                                     </div>
//                                     <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
//                                         <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">⚡ Lightning Fast</span>
//                                     </div>
//                                     <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
//                                         <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">📊 Detailed Data</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         ) : null}
//                     </div>
//                 </div>
//             </div>

//             {/* Custom Animations */}
//             <style jsx>{`
//         @keyframes blob {
//           0%, 100% { transform: translate(0, 0) scale(1); }
//           33% { transform: translate(30px, -50px) scale(1.1); }
//           66% { transform: translate(-20px, 20px) scale(0.9); }
//         }
//         @keyframes gradient {
//           0%, 100% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//         }
//         @keyframes fade-in {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-blob {
//           animation: blob 7s infinite;
//         }
//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }
//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .animate-fade-in {
//           animation: fade-in 0.6s ease-out;
//         }
//         .animate-bounce-slow {
//           animation: bounce 3s infinite;
//         }
//       `}</style>
//         </div>
//     );
// };

// export default Dashboard;

//////////////////////////////




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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950">

            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Enhanced Navbar */}
            <nav className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                    LeadFinder AI
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Powered by Google Maps</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleTheme}
                                className="relative p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:shadow-lg transition-all duration-300 group"
                                aria-label="Toggle theme"
                            >
                                {isDark ? (
                                    <svg className="w-5 h-5 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                    </svg>
                                )}
                            </button>

                            {isSignedIn ? (
                                <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-800">
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {user?.firstName || 'User'}
                                        </p>
                                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Premium Member</p>
                                    </div>
                                    <UserButton
                                        appearance={{
                                            elements: {
                                                avatarBox: 'w-10 h-10 ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900 shadow-lg'
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <SignInButton mode="modal">
                                        <button className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                                            Sign In
                                        </button>
                                    </SignInButton>
                                    <SignUpButton mode="modal">
                                        <button className="relative px-6 py-2.5 text-sm font-semibold text-white rounded-xl overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 transition-transform duration-300 group-hover:scale-105"></div>
                                            <span className="relative">Get Started Free</span>
                                        </button>
                                    </SignUpButton>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Hero Section */}
                <div className="text-center mb-12 animate-fade-in">
                    <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full mb-6 border border-purple-200 dark:border-purple-800 shadow-lg">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                            AI-Powered Business Intelligence
                        </span>
                    </div>

                    <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                        Discover Your Next
                        <br />
                        <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                            Million Dollar Lead
                        </span>
                    </h2>

                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Extract valuable business data from Google Maps with intelligent autocomplete,
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400"> real-time insights</span>, and
                        <span className="font-semibold text-purple-600 dark:text-purple-400"> instant exports</span>
                    </p>
                </div>

                {/* Search Mode Toggle */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 px-4">
                            Search Mode
                        </span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setUseAsyncSearch(false)}
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform ${!useAsyncSearch
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <span className="mr-2">⚡</span>
                                Instant Search
                            </button>
                            <button
                                onClick={() => setUseAsyncSearch(true)}
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform ${useAsyncSearch
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <span className="mr-2">⚙️</span>
                                Background Job
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search Form */}
                <div className="mb-12">
                    <SearchForm
                        onSearch={handleSearch}
                        initialKeyword={selectedKeyword}
                        initialLocation={selectedLocation}
                    />
                </div>

                {/* Enhanced Stats Dashboard */}
                {businesses.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                        {[
                            {
                                label: 'Total Found',
                                value: stats.total,
                                icon: '🏢',
                                gradient: 'from-purple-500 to-indigo-600',
                                bgGradient: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20'
                            },
                            {
                                label: 'Avg Rating',
                                value: `${stats.avgRating}⭐`,
                                icon: '📊',
                                gradient: 'from-yellow-500 to-orange-600',
                                bgGradient: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
                            },
                            {
                                label: 'Top Rated',
                                value: stats.highlyRated,
                                icon: '🌟',
                                gradient: 'from-pink-500 to-rose-600',
                                bgGradient: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20'
                            },
                            {
                                label: 'With Website',
                                value: stats.withWebsite,
                                icon: '🌐',
                                gradient: 'from-blue-500 to-cyan-600',
                                bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
                            },
                            {
                                label: 'With Phone',
                                value: stats.withPhone,
                                icon: '📱',
                                gradient: 'from-green-500 to-emerald-600',
                                bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                            },
                            {
                                label: 'Verified',
                                value: stats.verified,
                                icon: '✓',
                                gradient: 'from-teal-500 to-cyan-600',
                                bgGradient: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20'
                            }
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-3xl">{stat.icon}</span>
                                    <div className={`px-2 py-1 bg-gradient-to-r ${stat.gradient} rounded-full`}>
                                        <span className="text-xs font-bold text-white">Live</span>
                                    </div>
                                </div>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Job Status */}
                {currentJobId && (
                    <div className="mb-8">
                        <JobStatus jobId={currentJobId} onComplete={handleJobComplete} />
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-300 dark:border-red-800 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-red-900 dark:text-red-200 mb-1">Oops! Something went wrong</h4>
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Controls Bar */}
                {businesses.length > 0 && (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 mb-8">
                        <div className="space-y-6">
                            {/* Main Controls Row */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                {/* View Mode */}
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">View:</span>
                                    <div className="inline-flex rounded-xl border-2 border-gray-300 dark:border-gray-600 overflow-hidden shadow-lg">
                                        {['table', 'map', 'grid'].map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setViewMode(mode)}
                                                className={`px-5 py-2.5 text-sm font-bold capitalize transition-all duration-300 ${viewMode === mode
                                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                {mode === 'table' && '📋'}
                                                {mode === 'map' && '🗺️'}
                                                {mode === 'grid' && '📱'}
                                                <span className="ml-2">{mode}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Filters */}
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Rating:</span>
                                        <select
                                            value={filterRating}
                                            onChange={(e) => setFilterRating(Number(e.target.value))}
                                            className="px-4 py-2.5 text-sm font-medium border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500 focus:border-purple-500 shadow-lg transition-all"
                                        >
                                            <option value={0}>All ⭐</option>
                                            <option value={3.5}>3.5+ ⭐⭐⭐</option>
                                            <option value={4}>4+ ⭐⭐⭐⭐</option>
                                            <option value={4.5}>4.5+ ⭐⭐⭐⭐⭐</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Sort:</span>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="px-4 py-2.5 text-sm font-medium border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500 focus:border-purple-500 shadow-lg transition-all"
                                        >
                                            <option value="relevance">🎯 Relevance</option>
                                            <option value="rating">⭐ Highest Rated</option>
                                            <option value="reviews">💬 Most Reviews</option>
                                            <option value="distance">📍 Nearest</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        className="px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 rounded-xl hover:shadow-lg transition-all border-2 border-purple-300 dark:border-purple-700"
                                    >
                                        <span className="mr-2">🔧</span>
                                        {showAdvancedFilters ? 'Hide' : 'Advanced'}
                                    </button>

                                    <ExportButtons businesses={filteredBusinesses} />
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            {showAdvancedFilters && (
                                <div className="pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Price Range</label>
                                            <select
                                                value={priceRange}
                                                onChange={(e) => setPriceRange(e.target.value)}
                                                className="w-full px-4 py-2.5 text-sm font-medium border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500"
                                            >
                                                <option value="all">All Prices 💰</option>
                                                <option value="$">Budget $ 💵</option>
                                                <option value="$$">Moderate $$ 💳</option>
                                                <option value="$$$">Expensive $$$ 💎</option>
                                                <option value="$$$$">Luxury $$$$ 👑</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Business Hours</label>
                                            <div className="flex items-center space-x-3 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={openNow}
                                                    onChange={(e) => setOpenNow(e.target.checked)}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                                />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Open Now 🕐
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Results</label>
                                            <div className="px-4 py-2.5 border-2 border-purple-300 dark:border-purple-700 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                                                <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                                                    {filteredBusinesses.length} of {businesses.length} businesses
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar - Search History */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-28">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Searches</h3>
                            </div>
                            <SearchHistory onSelect={handleSelectHistory} />
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="lg:col-span-3">
                        {businesses.length > 0 ? (
                            <div className="space-y-6">
                                {/* Results Header */}
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-2xl font-black text-white flex items-center">
                                                    <svg className="w-7 h-7 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                                    </svg>
                                                    Found {filteredBusinesses.length} businesses
                                                </h3>
                                                <p className="text-purple-100 mt-2">
                                                    {selectedKeyword && selectedLocation && (
                                                        <span>Searching for <span className="font-bold">"{selectedKeyword}"</span> in <span className="font-bold">{selectedLocation}</span></span>
                                                    )}
                                                </p>
                                            </div>
                                            {selectedLocation && (
                                                <div className="hidden md:block">
                                                    <div className="px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                                        <p className="text-xs text-purple-100 font-semibold mb-1">Location</p>
                                                        <p className="text-sm text-white font-bold flex items-center">
                                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                            </svg>
                                                            {selectedLocation}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {viewMode === 'table' && <BusinessTable businesses={filteredBusinesses} />}
                                        {viewMode === 'map' && <BusinessMap businesses={filteredBusinesses} />}
                                        {viewMode === 'grid' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {filteredBusinesses.map((business, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => setSelectedBusiness(business)}
                                                        className="group cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-2"
                                                    >
                                                        {/* Business Image */}
                                                        <div className="relative h-48 bg-gradient-to-br from-purple-400 to-indigo-600 overflow-hidden">
                                                            {business.photoUrl ? (
                                                                <img
                                                                    src={business.photoUrl}
                                                                    alt={business.name}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <svg className="w-20 h-20 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                                            {/* Status Badge */}
                                                            <div className="absolute top-4 right-4">
                                                                {business.isOpenNow ? (
                                                                    <div className="px-3 py-1 bg-green-500 rounded-full flex items-center space-x-1 shadow-lg">
                                                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                                                        <span className="text-xs font-bold text-white">Open Now</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="px-3 py-1 bg-gray-700 rounded-full">
                                                                        <span className="text-xs font-bold text-white">Closed</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Rating Badge */}
                                                            {business.rating && (
                                                                <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/95 rounded-full flex items-center space-x-1 shadow-lg">
                                                                    <span className="text-yellow-500">⭐</span>
                                                                    <span className="text-sm font-bold text-gray-900">{business.rating}</span>
                                                                    {business.reviewCount && (
                                                                        <span className="text-xs text-gray-500">({business.reviewCount})</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Business Info */}
                                                        <div className="p-6">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                                                    {business.name}
                                                                </h4>
                                                                {business.verified && (
                                                                    <div className="flex-shrink-0 ml-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Category */}
                                                            {business.category && (
                                                                <div className="mb-3">
                                                                    <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
                                                                        {business.category}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Address */}
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-start line-clamp-2">
                                                                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                                </svg>
                                                                {business.address}
                                                            </p>

                                                            {/* Price Level */}
                                                            {business.priceLevel && (
                                                                <div className="mb-4">
                                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                                        {business.priceLevel}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Contact Info */}
                                                            <div className="space-y-2 mb-4">
                                                                {business.phone && (
                                                                    <div className="flex items-center space-x-2">
                                                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                                                            <span className="text-sm">📞</span>
                                                                        </div>
                                                                        <a
                                                                            href={`tel:${business.phone}`}
                                                                            className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            {business.phone}
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                {business.website && (
                                                                    <div className="flex items-center space-x-2">
                                                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                                            <span className="text-sm">🌐</span>
                                                                        </div>
                                                                        <a
                                                                            href={business.website}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate font-medium"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            Visit Website
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Quick Actions */}
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <button className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all">
                                                                    View Details
                                                                </button>
                                                                <button className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all">
                                                                    Get Directions
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : !error && !currentJobId && !isSearching ? (
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-16 text-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
                                    <svg className="w-16 h-16 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                                    Ready to Find Businesses?
                                </h3>
                                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                                    Enter a keyword and location above to discover amazing businesses with our AI-powered search engine
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">🎯 Accurate Results</span>
                                    </div>
                                    <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">⚡ Lightning Fast</span>
                                    </div>
                                    <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">📊 Detailed Data</span>
                                    </div>
                                    <div className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                                        <span className="text-sm font-semibold text-pink-700 dark:text-pink-300">🖼️ Visual Cards</span>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Business Detail Modal */}
            {selectedBusiness && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedBusiness(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header with Image */}
                        <div className="relative h-64 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-t-3xl overflow-hidden">
                            {selectedBusiness.photoUrl ? (
                                <img
                                    src={selectedBusiness.photoUrl}
                                    alt={selectedBusiness.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-32 h-32 text-white/30" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedBusiness(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
                            >
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Business Name & Rating */}
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-black text-white mb-2">{selectedBusiness.name}</h2>
                                        {selectedBusiness.category && (
                                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-full">
                                                {selectedBusiness.category}
                                            </span>
                                        )}
                                    </div>
                                    {selectedBusiness.rating && (
                                        <div className="px-4 py-2 bg-white rounded-full flex items-center space-x-2 shadow-lg">
                                            <span className="text-yellow-500 text-xl">⭐</span>
                                            <div>
                                                <p className="text-lg font-black text-gray-900">{selectedBusiness.rating}</p>
                                                {selectedBusiness.reviewCount && (
                                                    <p className="text-xs text-gray-500">{selectedBusiness.reviewCount} reviews</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column - Contact Info */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                            <svg className="w-6 h-6 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            Contact Information
                                        </h3>

                                        <div className="space-y-4">
                                            {selectedBusiness.address && (
                                                <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Address</p>
                                                        <p className="text-sm text-gray-900 dark:text-white">{selectedBusiness.address}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedBusiness.phone && (
                                                <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                                                        <a href={`tel:${selectedBusiness.phone}`} className="text-sm text-gray-900 dark:text-white hover:text-purple-600 transition-colors">
                                                            {selectedBusiness.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedBusiness.website && (
                                                <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Website</p>
                                                        <a
                                                            href={selectedBusiness.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-gray-900 dark:text-white hover:text-purple-600 transition-colors break-all"
                                                        >
                                                            Visit Website →
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Additional Info */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                            <svg className="w-6 h-6 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Business Details
                                        </h3>

                                        <div className="space-y-4">
                                            {selectedBusiness.priceLevel && (
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Price Range</p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBusiness.priceLevel}</p>
                                                </div>
                                            )}

                                            {selectedBusiness.isOpenNow !== undefined && (
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Status</p>
                                                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${selectedBusiness.isOpenNow ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                                        <span className={`w-2 h-2 rounded-full ${selectedBusiness.isOpenNow ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                                        <span className={`text-sm font-bold ${selectedBusiness.isOpenNow ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                                            {selectedBusiness.isOpenNow ? 'Open Now' : 'Closed'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedBusiness.distance && (
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Distance</p>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedBusiness.distance} km away</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3 pt-4">
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBusiness.address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-center hover:shadow-lg transition-all"
                                        >
                                            📍 Directions
                                        </a>
                                        <button className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                                            💾 Save Lead
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                .animate-bounce-slow {
                    animation: bounce 3s infinite;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;