// import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
// import { useState } from 'react';

// const BusinessMap = ({ businesses }) => {
//     const [selectedBusiness, setSelectedBusiness] = useState(null);

//     // Filter businesses with valid coordinates
//     const businessesWithCoords = businesses.filter(
//         business => business.latitude && business.longitude
//     );

//     if (businessesWithCoords.length === 0) {
//         return (
//             <div className="h-full flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-900/50">
//                 <div className="text-center p-8">
//                     <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-slate-800 to-slate-800 dark:from-slate-800/40 dark:to-slate-800/40 rounded-3xl flex items-center justify-center">
//                         <svg className="w-10 h-10 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
//                         </svg>
//                     </div>
//                     <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No location data available</p>
//                     <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Map preview will appear when locations are found</p>
//                 </div>
//             </div>
//         );
//     }

//     // Calculate center point
//     const centerLat = businessesWithCoords.reduce((sum, b) => sum + parseFloat(b.latitude), 0) / businessesWithCoords.length;
//     const centerLng = businessesWithCoords.reduce((sum, b) => sum + parseFloat(b.longitude), 0) / businessesWithCoords.length;

//     // Google Maps API key from environment
//     const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';

//     return (
//         <div className="h-full w-full relative">
//             <APIProvider apiKey={apiKey}>
//                 <Map
//                     defaultCenter={{ lat: centerLat, lng: centerLng }}
//                     defaultZoom={12}
//                     mapId="business-map"
//                     style={{ width: '100%', height: '100%' }}
//                 >
//                     {businessesWithCoords.map((business, index) => (
//                         <AdvancedMarker
//                             key={index}
//                             position={{
//                                 lat: parseFloat(business.latitude),
//                                 lng: parseFloat(business.longitude),
//                             }}
//                             onClick={() => setSelectedBusiness(business)}
//                         />
//                     ))}

//                     {selectedBusiness && (
//                         <InfoWindow
//                             position={{
//                                 lat: parseFloat(selectedBusiness.latitude),
//                                 lng: parseFloat(selectedBusiness.longitude),
//                             }}
//                             onCloseClick={() => setSelectedBusiness(null)}
//                         >
//                             <div className="p-3 min-w-[220px] max-w-[280px]">
//                                 {/* Business Name */}
//                                 <h4 className="font-bold text-base text-slate-700 dark:text-slate-600 mb-2 line-clamp-2">
//                                     {selectedBusiness.name}
//                                 </h4>

//                                 <div className="space-y-2 text-sm">
//                                     {/* Address */}
//                                     {selectedBusiness.address && (
//                                         <div className="flex items-start gap-2 text-zinc-600">
//                                             <span className="flex-shrink-0 text-base">📍</span>
//                                             <span className="line-clamp-2">{selectedBusiness.address}</span>
//                                         </div>
//                                     )}

//                                     {/* Rating */}
//                                     {selectedBusiness.rating && (
//                                         <div className="flex items-center gap-2">
//                                             <span className="text-base">⭐</span>
//                                             <span className="font-semibold text-zinc-800">
//                                                 {selectedBusiness.rating}
//                                             </span>
//                                             {selectedBusiness.reviewCount && (
//                                                 <span className="text-zinc-500">
//                                                     ({selectedBusiness.reviewCount} reviews)
//                                                 </span>
//                                             )}
//                                         </div>
//                                     )}

//                                     {/* Phone */}
//                                     {selectedBusiness.phone && (
//                                         <a
//                                             href={`tel:${selectedBusiness.phone}`}
//                                             className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
//                                         >
//                                             <span className="text-base">📞</span>
//                                             <span>{selectedBusiness.phone}</span>
//                                         </a>
//                                     )}

//                                     {/* Website */}
//                                     {selectedBusiness.website && (
//                                         <a
//                                             href={selectedBusiness.website}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
//                                         >
//                                             <span className="text-base">🔗</span>
//                                             <span>Visit Website</span>
//                                         </a>
//                                     )}
//                                 </div>
//                             </div>
//                         </InfoWindow>
//                     )}
//                 </Map>
//             </APIProvider>

//             {/* Floating badge showing count */}
//             <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-full shadow-lg border border-zinc-200/50 dark:border-zinc-700/50">
//                 <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
//                     <span className="text-slate-700 dark:text-slate-400">{businessesWithCoords.length}</span> locations
//                 </span>
//             </div>
//         </div>
//     );
// };

// export default BusinessMap;


import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { useState } from 'react';

const BusinessMap = ({ businesses }) => {
    const [selectedBusiness, setSelectedBusiness] = useState(null);

    // Filter businesses with valid coordinates
    const businessesWithCoords = businesses.filter(
        business => business.latitude && business.longitude
    );

    if (businessesWithCoords.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                <div className="text-center p-12">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-600/20 to-slate-700/20 rounded-3xl blur-2xl"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                            <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-base font-bold text-slate-400 mb-2">No Location Data Available</p>
                    <p className="text-sm text-slate-600">Map preview will appear when locations are found</p>
                </div>
            </div>
        );
    }

    // Calculate center point
    const centerLat = businessesWithCoords.reduce((sum, b) => sum + parseFloat(b.latitude), 0) / businessesWithCoords.length;
    const centerLng = businessesWithCoords.reduce((sum, b) => sum + parseFloat(b.longitude), 0) / businessesWithCoords.length;

    // Google Maps API key from environment
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const isInvalidKey = !apiKey || apiKey === 'YOUR_API_KEY' || apiKey.includes('AIza') === false || apiKey.length < 20;

    if (isInvalidKey) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-900 border border-white/5 rounded-xl">
                <div className="text-center p-8">
                    <div className="text-4xl mb-4">🗺️</div>
                    <p className="text-slate-400 font-bold">Map Preview Unavailable</p>
                    <p className="text-slate-500 text-sm mt-1">Please provide a valid Google Maps API Key in .env to enable the map.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative">
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={{ lat: centerLat, lng: centerLng }}
                    defaultZoom={12}
                    mapId="business-map"
                    style={{ width: '100%', height: '100%' }}
                    options={{
                        styles: [
                            {
                                "featureType": "all",
                                "elementType": "geometry",
                                "stylers": [{ "color": "#0f172a" }]
                            },
                            {
                                "featureType": "all",
                                "elementType": "labels.text.fill",
                                "stylers": [{ "color": "#94a3b8" }]
                            },
                            {
                                "featureType": "all",
                                "elementType": "labels.text.stroke",
                                "stylers": [{ "visibility": "off" }]
                            },
                            {
                                "featureType": "road",
                                "elementType": "geometry",
                                "stylers": [{ "color": "#1e293b" }]
                            },
                            {
                                "featureType": "water",
                                "elementType": "geometry",
                                "stylers": [{ "color": "#0c1429" }]
                            }
                        ]
                    }}
                >
                    {businessesWithCoords.map((business, index) => (
                        <AdvancedMarker
                            key={index}
                            position={{
                                lat: parseFloat(business.latitude),
                                lng: parseFloat(business.longitude),
                            }}
                            onClick={() => setSelectedBusiness(business)}
                        />
                    ))}

                    {selectedBusiness && (
                        <InfoWindow
                            position={{
                                lat: parseFloat(selectedBusiness.latitude),
                                lng: parseFloat(selectedBusiness.longitude),
                            }}
                            onCloseClick={() => setSelectedBusiness(null)}
                        >
                            <div className="p-4 min-w-[260px] max-w-[320px] bg-gradient-to-br from-slate-900 to-slate-950">
                                {/* Business Name */}
                                <h4 className="font-black text-lg text-white mb-3 line-clamp-2">
                                    {selectedBusiness.name}
                                </h4>

                                <div className="space-y-3 text-sm">
                                    {/* Address */}
                                    {selectedBusiness.address && (
                                        <div className="flex items-start gap-2 text-slate-300">
                                            <span className="text-lg flex-shrink-0">📍</span>
                                            <span className="line-clamp-2 font-medium">{selectedBusiness.address}</span>
                                        </div>
                                    )}

                                    {/* Rating */}
                                    {selectedBusiness.rating && (
                                        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
                                            <span className="text-lg">⭐</span>
                                            <span className="font-black text-white">
                                                {selectedBusiness.rating}
                                            </span>
                                            {selectedBusiness.reviewCount && (
                                                <span className="text-slate-400 font-semibold">
                                                    ({selectedBusiness.reviewCount})
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Phone */}
                                    {selectedBusiness.phone && selectedBusiness.phone !== 'N/A' && (
                                        <a
                                            href={`tel:${selectedBusiness.phone}`}
                                            className="flex items-center gap-2 p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg transition-all border border-emerald-500/20 hover:border-emerald-500/40"
                                        >
                                            <span className="text-lg">📞</span>
                                            <span className="font-bold">{selectedBusiness.phone}</span>
                                        </a>
                                    )}

                                    {/* Website */}
                                    {selectedBusiness.website && selectedBusiness.website !== 'N/A' && (
                                        <a
                                            href={selectedBusiness.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded-lg transition-all font-bold border border-cyan-500/20 hover:border-cyan-500/40"
                                        >
                                            <span className="text-lg">🔗</span>
                                            <span>Visit Website</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </APIProvider>

            {/* Floating Location Counter */}
            <div className="absolute bottom-6 left-6 px-5 py-3 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Locations</div>
                        <div className="text-lg font-black text-white">{businessesWithCoords.length}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessMap;