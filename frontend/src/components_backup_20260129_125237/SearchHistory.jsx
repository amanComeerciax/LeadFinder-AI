import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getSearchHistory } from '../api/business.api';

const SearchHistory = ({ onSelectHistory }) => {
    const { getToken, isSignedIn } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [isSignedIn]); // Re-fetch when sign-in status changes

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const token = isSignedIn ? await getToken() : null;
            const result = await getSearchHistory(5, token);
            setHistory(result.data);
        } catch (error) {
            console.error('Failed to fetch history:', error);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="glass-effect dark:bg-gray-800/90 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    // Don't show if no history or user is not signed in
    if (history.length === 0 || !isSignedIn) {
        return null;
    }

    return (
        <div className="glass-effect dark:bg-gray-800/90 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Your Recent Searches</h3>
            </div>
            <div className="space-y-2">
                {history.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => onSelectHistory(item.keyword, item.location)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{item.keyword}</span>
                                    <span className="text-gray-400 dark:text-gray-500">in</span>
                                    <span className="font-medium text-gray-600 dark:text-gray-300">{item.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        {item.resultsCount} results
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchHistory;
