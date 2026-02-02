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
            <div className="glass-effect dark:bg-gray-800/90 rounded-xl p-8 text-center mb-6">
                <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">No location data available for map preview</p>
            </div>
        );
    }

    // Calculate center point
    const centerLat = businessesWithCoords.reduce((sum, b) => sum + parseFloat(b.latitude), 0) / businessesWithCoords.length;
    const centerLng = businessesWithCoords.reduce((sum, b) => sum + parseFloat(b.longitude), 0) / businessesWithCoords.length;

    // Google Maps API key from environment
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';

    return (
        <div className="glass-effect dark:bg-gray-800/90 rounded-xl overflow-hidden shadow-xl mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600/10 to-pink-600/10 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Google Maps Preview</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {businessesWithCoords.length} location{businessesWithCoords.length > 1 ? 's' : ''} marked
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ height: '500px', width: '100%' }}>
                <APIProvider apiKey={apiKey}>
                    <Map
                        defaultCenter={{ lat: centerLat, lng: centerLng }}
                        defaultZoom={12}
                        mapId="business-map"
                        style={{ width: '100%', height: '100%' }}
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
                                <div className="p-2 min-w-[200px]">
                                    <h4 className="font-bold text-purple-600 mb-2">{selectedBusiness.name}</h4>
                                    {selectedBusiness.address && (
                                        <p className="text-sm text-gray-600 mb-1">
                                            📍 {selectedBusiness.address}
                                        </p>
                                    )}
                                    {selectedBusiness.rating && (
                                        <p className="text-sm text-gray-600 mb-1">
                                            ⭐ {selectedBusiness.rating} ({selectedBusiness.reviews} reviews)
                                        </p>
                                    )}
                                    {selectedBusiness.phone && (
                                        <p className="text-sm text-gray-600 mb-1">
                                            📞 {selectedBusiness.phone}
                                        </p>
                                    )}
                                    {selectedBusiness.website && (
                                        <a
                                            href={selectedBusiness.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline block mt-2"
                                        >
                                            🔗 Visit Website
                                        </a>
                                    )}
                                </div>
                            </InfoWindow>
                        )}
                    </Map>
                </APIProvider>
            </div>
        </div>
    );
};

export default BusinessMap;
