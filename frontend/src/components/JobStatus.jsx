import { useEffect, useState } from 'react';
import { getJobStatus } from '../api/business.api';

const JobStatus = ({ jobId, onComplete }) => {
    const [jobData, setJobData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!jobId) return;

        const pollInterval = setInterval(async () => {
            try {
                const result = await getJobStatus(jobId);
                setJobData(result.job);

                if (result.job.status === 'completed') {
                    clearInterval(pollInterval);
                    onComplete(result.data);
                } else if (result.job.status === 'failed') {
                    clearInterval(pollInterval);
                    setError(result.job.error);
                }
            } catch (err) {
                setError('Failed to fetch job status');
                clearInterval(pollInterval);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(pollInterval);
    }, [jobId, onComplete]);

    if (!jobData) {
        return (
            <div className="glass-effect rounded-xl p-6 mb-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
            </div>
        );
    }

    return (
        <div className="glass-effect rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        {jobData.status === 'queued' && '⏳ Job Queued'}
                        {jobData.status === 'processing' && '⚙️ Processing...'}
                        {jobData.status === 'completed' && '✅ Completed'}
                        {jobData.status === 'failed' && '❌ Failed'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Searching for <span className="font-medium">{jobData.keyword}</span> in{' '}
                        <span className="font-medium">{jobData.location}</span>
                    </p>
                </div>
                {jobData.status === 'completed' && (
                    <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{jobData.resultsCount}</div>
                        <div className="text-xs text-gray-500">Results</div>
                    </div>
                )}
            </div>

            {(jobData.status === 'queued' || jobData.status === 'processing') && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-medium text-purple-600">{jobData.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                            style={{ width: `${jobData.progress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobStatus;
