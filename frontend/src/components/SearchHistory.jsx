import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getSearchHistory } from '../api/business.api';

const SearchHistory = ({ onSelectHistory }) => {
    const { getToken, isSignedIn } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [isSignedIn]);

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
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (history.length === 0 || !isSignedIn) {
        return (
            <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent searches</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your history will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {history.map((item, index) => (
                <div
                    key={index}
                    onClick={() => onSelectHistory(item.keyword, item.location)}
                    className="group flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-800/20 transition-colors"
                >
                    {/* Icon */}
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 group-hover:bg-slate-800 dark:group-hover:bg-slate-800/30 rounded-lg flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-slate-700 dark:group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {item.keyword}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm truncate">
                                {item.location}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="text-slate-700 dark:text-slate-400 font-medium">{item.resultsCount} leads</span>
                            <span>•</span>
                            <span>
                                {new Date(item.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-slate-700 dark:group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            ))}
        </div>
    );
};

export default SearchHistory;
