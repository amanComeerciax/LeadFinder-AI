// import { useState } from 'react';

// const BusinessTable = ({ businesses, onBusinessUpdate }) => {
//     const [currentPage, setCurrentPage] = useState(1);
//     const [imageErrors, setImageErrors] = useState({});
//     const itemsPerPage = 12;

//     const totalPages = Math.ceil(businesses.length / itemsPerPage);
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const currentBusinesses = businesses.slice(startIndex, startIndex + itemsPerPage);

//     const handleImageError = (businessId) => {
//         setImageErrors(prev => ({ ...prev, [businessId]: true }));
//     };

//     const socialLinks = [
//         { key: 'facebookUrl', name: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
//         { key: 'instagramUrl', name: 'Instagram', icon: 'M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z', color: 'bg-gradient-to-br from-slate-700 via-slate-500 to-orange-400 hover:from-slate-600 hover:via-slate-600 hover:to-orange-500 text-white' },
//         { key: 'linkedinUrl', name: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', color: 'bg-blue-700 hover:bg-blue-800 text-white' },
//         { key: 'twitterUrl', name: 'Twitter', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z', color: 'bg-sky-500 hover:bg-sky-600 text-white' },
//     ];

//     // Check if business has any social links
//     const hasSocialLinks = (business) => {
//         return socialLinks.some(social => business[social.key] && business[social.key] !== 'N/A');
//     };

//     if (!businesses || businesses.length === 0) {
//         return (
//             <div className="text-center py-20">
//                 <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
//                     <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                     </svg>
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No businesses found</h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">Try searching with different keywords or location</p>
//             </div>
//         );
//     }

//     return (
//         <div>
//             {/* Business Cards Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
//                 {currentBusinesses.map((business, index) => {
//                     const businessId = startIndex + index;
//                     const showFallback = !business.photoUrl || imageErrors[businessId];

//                     return (
//                         <div
//                             key={businessId}
//                             className="group bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all duration-200"
//                         >
//                             {/* Business Image */}
//                             <div className="relative h-36 bg-gradient-to-br from-slate-800 to-gray-100 dark:from-slate-800/30 dark:to-gray-800 overflow-hidden">
//                                 {!showFallback ? (
//                                     <img
//                                         src={business.photoUrl}
//                                         alt={business.name}
//                                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                                         onError={() => handleImageError(businessId)}
//                                     />
//                                 ) : (
//                                     <div className="absolute inset-0 flex flex-col items-center justify-center">
//                                         <div className="w-14 h-14 bg-white/80 dark:bg-gray-700/80 rounded-xl flex items-center justify-center mb-2">
//                                             <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                                             </svg>
//                                         </div>
//                                         <span className="text-xs text-gray-500 dark:text-gray-400">No Image</span>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="p-5">
//                                 {/* Header */}
//                                 <div className="flex items-start justify-between gap-3 mb-4">
//                                     <div className="flex-1 min-w-0">
//                                         <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-slate-700 dark:group-hover:text-slate-400 transition-colors">
//                                             {business.name}
//                                         </h3>
//                                         <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1 flex items-center gap-1.5">
//                                             <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                                             </svg>
//                                             {business.address}
//                                         </p>
//                                     </div>

//                                     {/* Rating Badge */}
//                                     {business.rating && (
//                                         <div className="flex flex-col items-end">
//                                             <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 dark:bg-slate-800/30 rounded-lg">
//                                                 <svg className="w-3.5 h-3.5 text-slate-700 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
//                                                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                                                 </svg>
//                                                 <span className="font-semibold text-slate-600 dark:text-slate-300 text-sm">{business.rating}</span>
//                                             </div>
//                                             {business.reviewCount && (
//                                                 <span className="text-xs text-gray-400 mt-1">{business.reviewCount} reviews</span>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Contact Info */}
//                                 <div className="grid grid-cols-2 gap-2 mb-4">
//                                     {/* Phone */}
//                                     <a
//                                         href={business.phone ? `tel:${business.phone}` : '#'}
//                                         className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${business.phone
//                                             ? 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 text-gray-700 dark:text-gray-300'
//                                             : 'border-gray-100 dark:border-gray-800 text-gray-400 cursor-not-allowed'
//                                             }`}
//                                     >
//                                         <svg className="w-4 h-4 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                                         </svg>
//                                         <span className="text-xs font-medium truncate">{business.phone || 'N/A'}</span>
//                                     </a>

//                                     {/* Email */}
//                                     <a
//                                         href={business.email && business.email !== 'N/A' ? `mailto:${business.email}` : '#'}
//                                         className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${business.email && business.email !== 'N/A'
//                                             ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300'
//                                             : 'border-gray-100 dark:border-gray-800 text-gray-400 cursor-not-allowed'
//                                             }`}
//                                     >
//                                         <svg className="w-4 h-4 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                                         </svg>
//                                         <span className="text-xs font-medium truncate">{business.email && business.email !== 'N/A' ? business.email : 'N/A'}</span>
//                                     </a>
//                                 </div>

//                                 {/* Website */}
//                                 <a
//                                     href={business.website || '#'}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className={`flex items-center gap-2 p-2.5 mb-4 border rounded-lg transition-all group/link ${business.website
//                                         ? 'border-gray-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-slate-700'
//                                         : 'border-gray-100 dark:border-gray-800 text-gray-400 cursor-not-allowed'
//                                         }`}
//                                 >
//                                     <svg className="w-4 h-4 flex-shrink-0 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
//                                     </svg>
//                                     <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate flex-1">
//                                         {business.website ? business.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0] : 'N/A'}
//                                     </span>
//                                     {business.website && (
//                                         <svg className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover/link:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//                                         </svg>
//                                     )}
//                                 </a>

//                                 {/* Social Links Section */}
//                                 <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
//                                     <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Social Media</p>
//                                     <div className="flex items-center gap-2 flex-wrap">
//                                         {socialLinks.map((social) => {
//                                             const url = business[social.key];
//                                             const hasLink = url && url !== 'N/A' && url.length > 5;

//                                             return (
//                                                 <a
//                                                     key={social.key}
//                                                     href={hasLink ? url : '#'}
//                                                     target={hasLink ? "_blank" : undefined}
//                                                     rel="noopener noreferrer"
//                                                     className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${hasLink
//                                                             ? social.color
//                                                             : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
//                                                         }`}
//                                                     title={hasLink ? social.name : `No ${social.name}`}
//                                                 >
//                                                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//                                                         <path d={social.icon} />
//                                                     </svg>
//                                                 </a>
//                                             );
//                                         })}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//                 <div className="flex items-center justify-center gap-2 mt-8">
//                     <button
//                         onClick={() => setCurrentPage(currentPage - 1)}
//                         disabled={currentPage === 1}
//                         className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
//                     >
//                         Previous
//                     </button>

//                     <div className="flex items-center gap-1.5 px-2">
//                         {[...Array(Math.min(5, totalPages))].map((_, i) => {
//                             let pageNum;
//                             if (totalPages <= 5) {
//                                 pageNum = i + 1;
//                             } else if (currentPage <= 3) {
//                                 pageNum = i + 1;
//                             } else if (currentPage >= totalPages - 2) {
//                                 pageNum = totalPages - 4 + i;
//                             } else {
//                                 pageNum = currentPage - 2 + i;
//                             }

//                             return (
//                                 <button
//                                     key={pageNum}
//                                     onClick={() => setCurrentPage(pageNum)}
//                                     className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${currentPage === pageNum
//                                         ? 'bg-slate-700 text-white'
//                                         : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-slate-700'
//                                         }`}
//                                 >
//                                     {pageNum}
//                                 </button>
//                             );
//                         })}
//                     </div>

//                     <button
//                         onClick={() => setCurrentPage(currentPage + 1)}
//                         disabled={currentPage === totalPages}
//                         className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
//                     >
//                         Next
//                     </button>
//                 </div>
//             )}

//             {/* Page Info */}
//             <div className="text-center mt-4">
//                 <span className="text-sm text-gray-500 dark:text-gray-400">
//                     Showing <span className="font-medium text-gray-700 dark:text-gray-300">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, businesses.length)}</span> of <span className="font-medium text-gray-700 dark:text-gray-300">{businesses.length}</span> businesses
//                 </span>
//             </div>
//         </div>
//     );
// };

// export default BusinessTable;


import { useState } from 'react';

const BusinessTable = ({ businesses, onBusinessUpdate }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [imageErrors, setImageErrors] = useState({});
    const itemsPerPage = 12;

    const totalPages = Math.ceil(businesses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentBusinesses = businesses.slice(startIndex, startIndex + itemsPerPage);

    const handleImageError = (businessId) => {
        setImageErrors(prev => ({ ...prev, [businessId]: true }));
    };

    const socialLinks = [
        { key: 'facebookUrl', name: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', gradient: 'from-blue-500 to-blue-600' },
        { key: 'instagramUrl', name: 'Instagram', icon: 'M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z', gradient: 'from-pink-500 via-purple-500 to-orange-500' },
        { key: 'linkedinUrl', name: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', gradient: 'from-blue-600 to-blue-700' },
        { key: 'twitterUrl', name: 'Twitter', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', gradient: 'from-slate-700 to-slate-900' },
    ];

    if (!businesses || businesses.length === 0) {
        return (
            <div className="text-center py-24">
                <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-600/20 to-slate-700/20 rounded-3xl blur-2xl"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                        <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-3">No businesses found</h3>
                <p className="text-base text-slate-400">Try searching with different keywords or location</p>
            </div>
        );
    }

    return (
        <div>
            {/* Business Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentBusinesses.map((business, index) => {
                    const businessId = startIndex + index;
                    const showFallback = !business.photoUrl || imageErrors[businessId];

                    return (
                        <div
                            key={businessId}
                            className="group relative bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 backdrop-blur-xl"
                        >
                            {/* Hover glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Business Image */}
                            <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                                {!showFallback ? (
                                    <img
                                        src={business.photoUrl}
                                        alt={business.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={() => handleImageError(businessId)}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-3">
                                            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-slate-500 font-medium">No Image</span>
                                    </div>
                                )}

                                {/* Rating Badge */}
                                {business.rating && (
                                    <div className="absolute top-4 right-4">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
                                            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="font-black text-sm text-slate-900">{business.rating}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-lg text-white truncate group-hover:text-cyan-300 transition-colors">
                                            {business.name}
                                        </h3>
                                        <p className="text-sm text-slate-400 truncate mt-1 flex items-center gap-2">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                            {business.address}
                                        </p>
                                    </div>

                                    {business.reviewCount && (
                                        <span className="text-xs text-slate-500 font-semibold mt-1">
                                            {business.reviewCount} reviews
                                        </span>
                                    )}
                                </div>

                                {/* Contact Info */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {/* Phone */}
                                    <a
                                        href={business.phone && business.phone !== 'N/A' ? `tel:${business.phone}` : '#'}
                                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${business.phone && business.phone !== 'N/A'
                                            ? 'border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-300'
                                            : 'border-white/5 bg-white/5 text-slate-600 cursor-not-allowed'
                                            }`}
                                    >
                                        <svg className="w-4 h-4 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span className="text-xs font-bold truncate">{business.phone || 'N/A'}</span>
                                    </a>

                                    {/* Email */}
                                    <a
                                        href={business.email && business.email !== 'N/A' ? `mailto:${business.email}` : '#'}
                                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${business.email && business.email !== 'N/A'
                                            ? 'border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-slate-300 hover:text-blue-300'
                                            : 'border-white/5 bg-white/5 text-slate-600 cursor-not-allowed'
                                            }`}
                                    >
                                        <svg className="w-4 h-4 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs font-bold truncate">{business.email && business.email !== 'N/A' ? business.email : 'N/A'}</span>
                                    </a>
                                </div>

                                {/* Website */}
                                <a
                                    href={business.website && business.website !== 'N/A' ? business.website : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 p-3 mb-5 border rounded-xl transition-all group/link ${business.website && business.website !== 'N/A'
                                        ? 'border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10'
                                        : 'border-white/5 bg-white/5 text-slate-600 cursor-not-allowed'
                                        }`}
                                >
                                    <svg className="w-5 h-5 flex-shrink-0 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    <span className="text-sm font-bold text-slate-300 group-hover/link:text-purple-300 truncate flex-1">
                                        {business.website && business.website !== 'N/A' ? business.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0] : 'N/A'}
                                    </span>
                                    {business.website && business.website !== 'N/A' && (
                                        <svg className="w-4 h-4 text-slate-500 opacity-0 group-hover/link:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    )}
                                </a>

                                {/* Social Links Section */}
                                <div className="pt-5 border-t border-white/10">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Connect</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {socialLinks.map((social) => {
                                            const url = business[social.key];
                                            const hasLink = url && url !== 'N/A' && url.length > 5;

                                            return (
                                                <a
                                                    key={social.key}
                                                    href={hasLink ? url : '#'}
                                                    target={hasLink ? "_blank" : undefined}
                                                    rel="noopener noreferrer"
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${hasLink
                                                        ? `bg-gradient-to-br ${social.gradient} text-white hover:scale-110 shadow-lg`
                                                        : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/10'
                                                        }`}
                                                    title={hasLink ? social.name : `No ${social.name}`}
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d={social.icon} />
                                                    </svg>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 text-slate-300 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
                    >
                        Previous
                    </button>

                    <div className="flex items-center gap-2">
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-12 h-12 rounded-xl font-black text-sm transition-all ${currentPage === pageNum
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                                        : 'border border-white/10 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-300'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 text-slate-300 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Page Info */}
            <div className="text-center mt-6">
                <span className="text-sm text-slate-400 font-medium">
                    Showing <span className="font-black text-white">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, businesses.length)}</span> of <span className="font-black text-white">{businesses.length}</span> businesses
                </span>
            </div>
        </div>
    );
};

export default BusinessTable;