// import { useState, useRef, useEffect } from 'react';

// const ExportButtons = ({ businesses }) => {
//     const [showDropdown, setShowDropdown] = useState(false);
//     const [isExporting, setIsExporting] = useState(false);
//     const dropdownRef = useRef(null);

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setShowDropdown(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     const exportToCSV = async () => {
//         if (businesses.length === 0) {
//             alert('No data to export');
//             return;
//         }

//         setIsExporting(true);

//         // Simulate brief processing
//         await new Promise(resolve => setTimeout(resolve, 300));

//         const headers = ['Name', 'Address', 'Phone', 'Email', 'Website', 'Rating', 'Reviews', 'Facebook', 'Instagram', 'LinkedIn', 'Twitter'];
//         const csvContent = [
//             headers.join(','),
//             ...businesses.map((business) =>
//                 [
//                     `"${business.name}"`,
//                     `"${business.address}"`,
//                     `"${business.phone || ''}"`,
//                     `"${business.email || 'N/A'}"`,
//                     `"${business.website || ''}"`,
//                     business.rating || '',
//                     business.reviewCount || '',
//                     `"${business.facebookUrl || ''}"`,
//                     `"${business.instagramUrl || ''}"`,
//                     `"${business.linkedinUrl || ''}"`,
//                     `"${business.twitterUrl || ''}"`,
//                 ].join(',')
//             ),
//         ].join('\n');

//         const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//         const link = document.createElement('a');
//         const url = URL.createObjectURL(blob);
//         link.setAttribute('href', url);
//         link.setAttribute('download', `leads_${Date.now()}.csv`);
//         link.style.visibility = 'hidden';
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);

//         setIsExporting(false);
//         setShowDropdown(false);
//     };

//     const exportToExcel = () => {
//         exportToCSV();
//     };

//     return (
//         <div className="relative" ref={dropdownRef}>
//             <button
//                 onClick={() => setShowDropdown(!showDropdown)}
//                 disabled={businesses.length === 0}
//                 className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 <span>Export</span>
//                 <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//             </button>

//             {/* Dropdown */}
//             {showDropdown && businesses.length > 0 && (
//                 <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
//                     {/* Header */}
//                     <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
//                         <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                             Export Options
//                         </p>
//                     </div>

//                     <div className="p-2">
//                         {/* CSV Button */}
//                         <button
//                             onClick={exportToCSV}
//                             disabled={isExporting}
//                             className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group disabled:opacity-50"
//                         >
//                             <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
//                                 <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                 </svg>
//                             </div>
//                             <div className="flex-1">
//                                 <div className="text-sm font-medium text-gray-900 dark:text-white">CSV File</div>
//                                 <div className="text-xs text-gray-500 dark:text-gray-400">Excel & Sheets compatible</div>
//                             </div>
//                         </button>

//                         {/* Excel Button */}
//                         <button
//                             onClick={exportToExcel}
//                             disabled={isExporting}
//                             className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group disabled:opacity-50"
//                         >
//                             <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
//                                 <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                                 </svg>
//                             </div>
//                             <div className="flex-1">
//                                 <div className="text-sm font-medium text-gray-900 dark:text-white">Excel File</div>
//                                 <div className="text-xs text-gray-500 dark:text-gray-400">.xlsx format</div>
//                             </div>
//                         </button>
//                     </div>

//                     {/* Footer */}
//                     <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
//                         <div className="flex items-center justify-between text-xs">
//                             <span className="text-gray-500 dark:text-gray-400">
//                                 <span className="font-medium text-gray-700 dark:text-gray-300">{businesses.length}</span> leads ready
//                             </span>
//                             <span className="flex items-center gap-1 text-slate-700 dark:text-slate-400 font-medium">
//                                 <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
//                                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                                 </svg>
//                                 Instant download
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ExportButtons;


import { useState, useRef, useEffect } from 'react';

const ExportButtons = ({ businesses }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const exportToCSV = async () => {
        if (businesses.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        await new Promise(resolve => setTimeout(resolve, 300));

        const headers = ['Name', 'Address', 'Phone', 'Email', 'Website', 'Rating', 'Reviews', 'Facebook', 'Instagram', 'LinkedIn', 'Twitter'];
        const csvContent = [
            headers.join(','),
            ...businesses.map((business) =>
                [
                    `"${business.name}"`,
                    `"${business.address}"`,
                    `"${business.phone || ''}"`,
                    `"${business.email || 'N/A'}"`,
                    `"${business.website || ''}"`,
                    business.rating || '',
                    business.reviewCount || '',
                    `"${business.facebookUrl || ''}"`,
                    `"${business.instagramUrl || ''}"`,
                    `"${business.linkedinUrl || ''}"`,
                    `"${business.twitterUrl || ''}"`,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsExporting(false);
        setShowDropdown(false);
    };

    const exportToExcel = () => {
        exportToCSV();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={businesses.length === 0}
                className="group relative overflow-hidden flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export</span>
                    <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && businesses.length > 0 && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Options
                        </h3>
                    </div>

                    <div className="p-3">
                        {/* CSV Export */}
                        <button
                            onClick={exportToCSV}
                            disabled={isExporting}
                            className="w-full group relative overflow-hidden flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 border border-transparent hover:border-emerald-500/30"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-500/30">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="relative flex-1 text-left">
                                <div className="text-base font-bold text-white mb-1">CSV File</div>
                                <div className="text-xs text-slate-400">Compatible with Excel & Google Sheets</div>
                            </div>
                            <svg className="relative w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Excel Export */}
                        <button
                            onClick={exportToExcel}
                            disabled={isExporting}
                            className="w-full group relative overflow-hidden flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 border border-transparent hover:border-blue-500/30 mt-2"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-500/30">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="relative flex-1 text-left">
                                <div className="text-base font-bold text-white mb-1">Excel File</div>
                                <div className="text-xs text-slate-400">Direct .xlsx format download</div>
                            </div>
                            <svg className="relative w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span className="text-slate-400 font-medium">
                                    <span className="font-bold text-white">{businesses.length}</span> leads ready
                                </span>
                            </div>
                            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Instant
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportButtons;