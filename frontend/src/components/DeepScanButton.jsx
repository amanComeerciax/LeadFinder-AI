// import { useState } from 'react';
// import axios from 'axios';

// const DeepScanButton = ({ business, onScanComplete }) => {
//     const [scanning, setScanning] = useState(false);
//     const [scanStatus, setScanStatus] = useState(business?.deepScanStatus || null);
//     const [error, setError] = useState(null);

//     const handleDeepScan = async () => {
//         if (!business?._id) {
//             console.error('No business ID provided');
//             return;
//         }

//         if (scanning || scanStatus === 'scanning') {
//             return;
//         }

//         setScanning(true);
//         setError(null);
//         setScanStatus('scanning');

//         try {
//             const response = await axios.post(
//                 `${import.meta.env.VITE_BACKEND_URL}/api/business/deep-scan/${business._id}`
//             );

//             if (response.data.success) {
//                 setScanStatus('complete');
//                 setScanning(false);

//                 if (onScanComplete) {
//                     onScanComplete(response.data.data.business, response.data.data.scanResults);
//                 }
//             } else {
//                 throw new Error(response.data.message || 'Scan failed');
//             }
//         } catch (err) {
//             console.error('Deep scan error:', err);
//             setError(err.response?.data?.message || err.message || 'Failed to scan website');
//             setScanStatus('error');
//             setScanning(false);
//         }
//     };

//     // If no website, don't show button
//     if (!business?.website || business.website === 'N/A') {
//         return null;
//     }

//     // Already scanned - show success badge
//     if (scanStatus === 'complete' && !scanning) {
//         return (
//             <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/80 dark:border-emerald-700/30 rounded-xl shadow-sm">
//                 <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
//                     <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
//                     </svg>
//                 </div>
//                 <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Scanned</span>
//             </div>
//         );
//     }

//     // Error state - show retry
//     if (error && !scanning) {
//         return (
//             <button
//                 onClick={handleDeepScan}
//                 className="group relative overflow-hidden px-4 py-2.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
//             >
//                 <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-100 group-hover:opacity-90 transition-opacity rounded-xl" />
//                 <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity blur-lg rounded-xl" />
//                 <div className="relative flex items-center gap-2 text-white font-semibold text-sm">
//                     <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                     </svg>
//                     <span>Retry Scan</span>
//                 </div>
//             </button>
//         );
//     }

//     // Scanning state
//     if (scanning || scanStatus === 'scanning') {
//         return (
//             <div className="relative overflow-hidden inline-flex items-center gap-3 px-5 py-2.5 rounded-xl">
//                 <div className="absolute inset-0 bg-gradient-to-r from-slate-600 via-slate-600 to-slate-500 animate-pulse rounded-xl" />
//                 <div className="relative flex items-center gap-3 text-white">
//                     <div className="relative">
//                         <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         {/* Pulsing ring */}
//                         <div className="absolute inset-0 animate-ping opacity-30">
//                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
//                                 <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
//                             </svg>
//                         </div>
//                     </div>
//                     <span className="font-semibold text-sm">Scanning...</span>
//                 </div>
//             </div>
//         );
//     }

//     // Default state - show Deep Scan button
//     return (
//         <button
//             onClick={handleDeepScan}
//             className="group relative overflow-hidden px-4 py-2.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/25"
//             title="Extract emails, phone numbers, and social links from website"
//         >
//             {/* Background gradient */}
//             <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-slate-600 opacity-100 group-hover:opacity-90 transition-opacity rounded-xl" />

//             {/* Glow effect on hover */}
//             <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-slate-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-xl" />

//             {/* Shimmer effect */}
//             <div className="absolute inset-0 overflow-hidden rounded-xl">
//                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
//             </div>

//             {/* Button content */}
//             <div className="relative flex items-center gap-2 text-white font-bold text-sm">
//                 <svg className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//                 <span>Deep Scan</span>
//                 <svg className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                 </svg>
//             </div>
//         </button>
//     );
// };

// export default DeepScanButton;


import { useState } from 'react';
import axios from 'axios';

const DeepScanButton = ({ business, onScanComplete }) => {
    const [scanning, setScanning] = useState(false);
    const [scanStatus, setScanStatus] = useState(business?.deepScanStatus || null);
    const [error, setError] = useState(null);

    const handleDeepScan = async () => {
        if (!business?._id) {
            console.error('No business ID provided');
            return;
        }

        if (scanning || scanStatus === 'scanning') {
            return;
        }

        setScanning(true);
        setError(null);
        setScanStatus('scanning');

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/business/deep-scan/${business._id}`
            );

            if (response.data.success) {
                setScanStatus('complete');
                setScanning(false);

                if (onScanComplete) {
                    onScanComplete(response.data.data.business, response.data.data.scanResults);
                }
            } else {
                throw new Error(response.data.message || 'Scan failed');
            }
        } catch (err) {
            console.error('Deep scan error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to scan website');
            setScanStatus('error');
            setScanning(false);
        }
    };

    // If no website, don't show button
    if (!business?.website || business.website === 'N/A') {
        return null;
    }

    // Already scanned - show success badge
    if (scanStatus === 'complete' && !scanning) {
        return (
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400 rounded-lg blur-lg opacity-50"></div>
                    <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
                <span className="text-sm font-black text-emerald-300">Successfully Scanned</span>
            </div>
        );
    }

    // Error state - show retry
    if (error && !scanning) {
        return (
            <button
                onClick={handleDeepScan}
                className="group relative overflow-hidden px-5 py-3 rounded-xl transition-all duration-300 hover:scale-105"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-100 group-hover:opacity-90 transition-opacity rounded-xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-xl" />
                <div className="relative flex items-center gap-3 text-white font-black text-sm">
                    <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Retry Scan</span>
                </div>
            </button>
        );
    }

    // Scanning state
    if (scanning || scanStatus === 'scanning') {
        return (
            <div className="relative overflow-hidden inline-flex items-center gap-4 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse"></div>

                <div className="relative flex items-center gap-4 text-white">
                    <div className="relative">
                        {/* Spinning circle */}
                        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {/* Pulsing ring */}
                        <div className="absolute inset-0 animate-ping opacity-20">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                            </svg>
                        </div>
                    </div>
                    <span className="font-black text-base">Scanning Website...</span>
                </div>
            </div>
        );
    }

    // Default state - show Deep Scan button
    return (
        <button
            onClick={handleDeepScan}
            className="group relative overflow-hidden px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30"
            title="Extract emails, phone numbers, and social links from website"
        >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 opacity-100 group-hover:opacity-90 transition-opacity rounded-xl" />

            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl rounded-xl" />

            {/* Animated shimmer effect */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>

            {/* Button content */}
            <div className="relative flex items-center gap-3 text-white font-black text-base">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <span>Deep Scan</span>
                <svg className="w-5 h-5 opacity-80 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </div>
        </button>
    );
};

export default DeepScanButton;