// import { useEffect, useState } from 'react';
// import { useAuth } from '@clerk/clerk-react';
// import { useSocket } from '../context/SocketContext';
// import { cancelJob as cancelJobAPI } from '../api/business.api';

// const JobStatus = ({ jobId, onComplete }) => {
//     const { socket, connected } = useSocket();
//     const { getToken } = useAuth();
//     const [jobData, setJobData] = useState(null);
//     const [error, setError] = useState('');
//     const [progressMessage, setProgressMessage] = useState('Initializing...');
//     const [isCancelling, setIsCancelling] = useState(false);

//     useEffect(() => {
//         if (!jobId || !socket) return;

//         // Initialize job data
//         setJobData({
//             jobId,
//             status: 'processing',
//             progress: 0,
//             keyword: '',
//             location: ''
//         });

//         // Listen for job started event
//         const handleJobStarted = (data) => {
//             if (data.jobId === jobId) {
//                 console.log('🚀 Job started:', data);
//                 setJobData(prev => ({
//                     ...prev,
//                     keyword: data.keyword,
//                     location: data.location,
//                     status: 'processing',
//                     progress: 10
//                 }));
//                 setProgressMessage('Starting search...');
//             }
//         };

//         // Listen for progress updates
//         const handleJobProgress = (data) => {
//             if (data.jobId === jobId) {
//                 console.log('📊 Job progress:', data);
//                 setJobData(prev => ({
//                     ...prev,
//                     progress: data.progress
//                 }));
//                 setProgressMessage(data.message || 'Processing...');
//             }
//         };

//         // Listen for job completion
//         const handleJobCompleted = (data) => {
//             if (data.jobId === jobId) {
//                 console.log('✅ Job completed:', data);
//                 setJobData(prev => ({
//                     ...prev,
//                     status: 'completed',
//                     progress: 100,
//                     resultsCount: data.resultsCount
//                 }));
//                 setProgressMessage('Completed!');
//                 onComplete(data.data);
//             }
//         };

//         // Listen for job failure
//         const handleJobFailed = (data) => {
//             if (data.jobId === jobId) {
//                 console.error('❌ Job failed:', data);
//                 setJobData(prev => ({
//                     ...prev,
//                     status: 'failed',
//                     error: data.error
//                 }));
//                 setError(data.error);
//             }
//         };

//         // Listen for job cancellation
//         const handleJobCancelled = (data) => {
//             if (data.jobId === jobId) {
//                 console.log('🛑 Job cancelled:', data);
//                 setJobData(prev => ({
//                     ...prev,
//                     status: 'cancelled',
//                     progress: 0
//                 }));
//                 setProgressMessage('Cancelled by user');
//                 setIsCancelling(false);
//             }
//         };

//         // Register event listeners
//         socket.on('job:started', handleJobStarted);
//         socket.on('job:progress', handleJobProgress);
//         socket.on('job:completed', handleJobCompleted);
//         socket.on('job:failed', handleJobFailed);
//         socket.on('job:cancelled', handleJobCancelled);

//         // Cleanup
//         return () => {
//             socket.off('job:started', handleJobStarted);
//             socket.off('job:progress', handleJobProgress);
//             socket.off('job:completed', handleJobCompleted);
//             socket.off('job:failed', handleJobFailed);
//             socket.off('job:cancelled', handleJobCancelled);
//         };
//     }, [jobId, socket, onComplete]);

//     const handleCancelJob = async () => {
//         try {
//             setIsCancelling(true);
//             const token = await getToken();
//             await cancelJobAPI(jobId, token);
//             console.log('🛑 Cancel request sent for job:', jobId);
//         } catch (err) {
//             console.error('Failed to cancel job:', err);
//             setError('Failed to cancel job');
//             setIsCancelling(false);
//         }
//     };

//     if (!jobData) {
//         return (
//             <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
//                 <div className="animate-pulse space-y-4">
//                     <div className="flex items-center gap-4">
//                         <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
//                         <div className="flex-1 space-y-2">
//                             <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
//                             <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
//                         </div>
//                     </div>
//                     <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full" />
//                 </div>
//             </div>
//         );
//     }

//     const statusConfig = {
//         queued: {
//             icon: (
//                 <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//             ),
//             label: 'In Queue',
//             color: 'text-amber-600 dark:text-amber-400',
//             iconBg: 'bg-amber-100 dark:bg-amber-900/30',
//             progressBg: 'bg-amber-500'
//         },
//         processing: {
//             icon: (
//                 <svg className="w-6 h-6 text-slate-600 animate-spin" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//             ),
//             label: 'Processing',
//             color: 'text-slate-700 dark:text-slate-400',
//             iconBg: 'bg-slate-800 dark:bg-slate-800/30',
//             progressBg: 'bg-slate-600'
//         },
//         completed: {
//             icon: (
//                 <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//             ),
//             label: 'Completed',
//             color: 'text-green-600 dark:text-green-400',
//             iconBg: 'bg-green-100 dark:bg-green-900/30',
//             progressBg: 'bg-green-500'
//         },
//         failed: {
//             icon: (
//                 <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//             ),
//             label: 'Failed',
//             color: 'text-red-600 dark:text-red-400',
//             iconBg: 'bg-red-100 dark:bg-red-900/30',
//             progressBg: 'bg-red-500'
//         },
//         cancelled: {
//             icon: (
//                 <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
//                 </svg>
//             ),
//             label: 'Cancelled',
//             color: 'text-gray-600 dark:text-gray-400',
//             iconBg: 'bg-gray-100 dark:bg-gray-800/30',
//             progressBg: 'bg-gray-500'
//         },
//     };

//     const status = statusConfig[jobData.status];

//     return (
//         <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
//             <div className="p-6">
//                 <div className="flex items-center justify-between mb-5">
//                     <div className="flex items-center gap-4">
//                         {/* Status Icon */}
//                         <div className={`w-12 h-12 ${status.iconBg} rounded-xl flex items-center justify-center`}>
//                             {status.icon}
//                         </div>

//                         <div>
//                             <h3 className={`text-base font-semibold ${status.color}`}>
//                                 {status.label}
//                             </h3>
//                             <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
//                                 <span className="font-medium text-gray-900 dark:text-white">{jobData.keyword}</span>
//                                 <span className="mx-2">•</span>
//                                 {jobData.location}
//                             </p>
//                         </div>
//                     </div>

//                     {/* Connection Indicator */}
//                     <div className="flex items-center gap-2">
//                         {connected ? (
//                             <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-md">
//                                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
//                                 <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live</span>
//                             </div>
//                         ) : (
//                             <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
//                                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
//                                 <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Offline</span>
//                             </div>
//                         )}
//                     </div>

//                     {/* Cancel Button */}
//                     {(jobData.status === 'queued' || jobData.status === 'processing') && (
//                         <button
//                             onClick={handleCancelJob}
//                             disabled={isCancelling}
//                             className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                         >
//                             {isCancelling ? (
//                                 <>
//                                     <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg>
//                                     Cancelling...
//                                 </>
//                             ) : (
//                                 <>
//                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                     </svg>
//                                     Cancel
//                                 </>
//                             )}
//                         </button>
//                     )}

//                     {/* Results Counter */}
//                     {jobData.status === 'completed' && (
//                         <div className="text-right">
//                             <div className="text-3xl font-bold text-slate-700 dark:text-slate-400">
//                                 {jobData.resultsCount}
//                             </div>
//                             <div className="text-xs text-gray-500 dark:text-gray-400">
//                                 Leads Found
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Progress Bar */}
//                 {(jobData.status === 'queued' || jobData.status === 'processing') && (
//                     <div className="space-y-2">
//                         <div className="flex items-center justify-between text-sm">
//                             <span className="text-gray-600 dark:text-gray-400">Progress</span>
//                             <span className="font-semibold text-slate-700 dark:text-slate-400">
//                                 {jobData.progress}%
//                             </span>
//                         </div>
//                         <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
//                             <div
//                                 className={`h-full ${status.progressBg} rounded-full transition-all duration-500`}
//                                 style={{ width: `${jobData.progress}%` }}
//                             />
//                         </div>
//                         <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
//                             {progressMessage}
//                         </p>
//                     </div>
//                 )}

//                 {/* Error State */}
//                 {error && (
//                     <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//                         <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
//                             <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                             </svg>
//                             <span className="text-sm font-medium">{error}</span>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default JobStatus;


import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSocket } from '../context/SocketContext';
import { cancelJob as cancelJobAPI, getJobStatus } from '../api/business.api';

const JobStatus = ({
    jobId,
    onComplete,
    useTwoPhase = false,
    currentPhase = null,
    isEnrichmentPaused = false,
    onPauseEnrichment,
    onResumeEnrichment,
    onSkipEnrichment,
    usePostalCodes = false
}) => {
    const { socket, connected } = useSocket();
    const { getToken } = useAuth();
    const [jobData, setJobData] = useState(null);
    const [error, setError] = useState('');
    const [progressMessage, setProgressMessage] = useState('Initializing...');
    const [isCancelling, setIsCancelling] = useState(false);
    const [collectionProgress, setCollectionProgress] = useState(0);
    const [enrichmentProgress, setEnrichmentProgress] = useState(0);

    useEffect(() => {
        if (!jobId || !socket) return;

        setJobData({
            jobId,
            status: 'processing',
            progress: 0,
            keyword: '',
            location: ''
        });

        const handleJobStarted = (data) => {
            if (data.jobId === jobId) {
                console.log('🚀 Job started:', data);
                setJobData(prev => ({
                    ...prev,
                    keyword: data.keyword,
                    location: data.location,
                    status: 'processing',
                    progress: 10
                }));
                setProgressMessage(useTwoPhase ? 'Starting collection phase...' : 'Starting search...');
            }
        };

        const handleJobProgress = (data) => {
            if (data.jobId === jobId) {
                console.log('📊 Job progress:', data);
                setJobData(prev => ({
                    ...prev,
                    progress: data.progress
                }));
                setProgressMessage(data.message || 'Processing...');
            }
        };

        const handleCollectionProgress = (data) => {
            if (data.jobId === jobId) {
                console.log('📦 Collection progress:', data);
                setCollectionProgress(data.progress);
                setProgressMessage(data.message || `Collecting businesses...`);
            }
        };

        const handleEnrichmentProgress = (data) => {
            if (data.jobId === jobId) {
                console.log('✨ Enrichment progress:', data);
                setEnrichmentProgress(data.progress);
                setProgressMessage(data.message || `Enriching ${data.enriched}/${data.total} businesses...`);
            }
        };

        const handleJobCompleted = (data) => {
            if (data.jobId === jobId) {
                console.log('✅ Job completed:', data);
                setJobData(prev => ({
                    ...prev,
                    status: 'completed',
                    progress: 100,
                    resultsCount: data.resultsCount
                }));
                setCollectionProgress(100);
                setEnrichmentProgress(100);
                setProgressMessage('Completed!');
                onComplete(data.data);
            }
        };

        const handleJobFailed = (data) => {
            if (data.jobId === jobId) {
                console.error('❌ Job failed:', data);
                setJobData(prev => ({
                    ...prev,
                    status: 'failed',
                    error: data.error
                }));
                setError(data.error);
            }
        };

        const handleJobCancelled = (data) => {
            if (data.jobId === jobId) {
                console.log('🛑 Job cancelled:', data);
                setJobData(prev => ({
                    ...prev,
                    status: 'cancelled',
                    progress: 0
                }));
                setProgressMessage('Cancelled by user');
                setIsCancelling(false);
            }
        };

        // Fetch initial status
        const fetchStatus = async () => {
            try {
                const response = await getJobStatus(jobId);
                if (response.success && response.job) {
                    const job = response.job;
                    console.log('📄 Initial job status:', job);

                    setJobData({
                        jobId: job.jobId,
                        status: job.status,
                        progress: job.progress || 0,
                        keyword: job.keyword || '',
                        location: job.location || '',
                        resultsCount: job.resultsCount || 0
                    });

                    if (job.status === 'completed') {
                        setCollectionProgress(100);
                        setEnrichmentProgress(100);
                        setProgressMessage('Completed!');
                        if (response.data) {
                            onComplete(response.data);
                        }
                    } else if (job.status === 'processing') {
                        setProgressMessage(useTwoPhase ? 'Resuming search...' : 'Processing...');
                    }
                }
            } catch (err) {
                console.error('Failed to fetch initial status:', err);
            }
        };

        fetchStatus();

        socket.on('job:started', handleJobStarted);
        socket.on('job:progress', handleJobProgress);
        socket.on('job:collection:progress', handleCollectionProgress);
        socket.on('job:enrichment:progress', handleEnrichmentProgress);
        socket.on('job:completed', handleJobCompleted);
        socket.on('job:failed', handleJobFailed);
        socket.on('job:cancelled', handleJobCancelled);

        return () => {
            socket.off('job:started', handleJobStarted);
            socket.off('job:progress', handleJobProgress);
            socket.off('job:collection:progress', handleCollectionProgress);
            socket.off('job:enrichment:progress', handleEnrichmentProgress);
            socket.off('job:completed', handleJobCompleted);
            socket.off('job:failed', handleJobFailed);
            socket.off('job:cancelled', handleJobCancelled);
        };
    }, [jobId, socket, onComplete, useTwoPhase]);

    const handleCancelJob = async () => {
        try {
            setIsCancelling(true);
            const token = await getToken();
            await cancelJobAPI(jobId, token);
            console.log('🛑 Cancel request sent for job:', jobId);
        } catch (err) {
            console.error('Failed to cancel job:', err);
            setError('Failed to cancel job');
            setIsCancelling(false);
        }
    };

    if (!jobData) {
        return (
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <div className="animate-pulse space-y-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl" />
                        <div className="flex-1 space-y-3">
                            <div className="h-5 bg-white/10 rounded-lg w-1/3" />
                            <div className="h-4 bg-white/5 rounded-lg w-1/2" />
                        </div>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full" />
                </div>
            </div>
        );
    }

    const statusConfig = {
        queued: {
            icon: (
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            label: 'In Queue',
            color: 'text-amber-300',
            gradient: 'from-amber-500/20 to-yellow-500/20',
            borderColor: 'border-amber-500/30',
            progressGradient: 'from-amber-500 to-yellow-500'
        },
        processing: {
            icon: (
                <svg className="w-7 h-7 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ),
            label: 'Processing',
            color: 'text-cyan-300',
            gradient: 'from-cyan-500/20 to-blue-500/20',
            borderColor: 'border-cyan-500/30',
            progressGradient: 'from-cyan-500 to-blue-500'
        },
        completed: {
            icon: (
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            label: 'Completed',
            color: 'text-emerald-300',
            gradient: 'from-emerald-500/20 to-teal-500/20',
            borderColor: 'border-emerald-500/30',
            progressGradient: 'from-emerald-500 to-teal-500'
        },
        failed: {
            icon: (
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            label: 'Failed',
            color: 'text-red-300',
            gradient: 'from-red-500/20 to-rose-500/20',
            borderColor: 'border-red-500/30',
            progressGradient: 'from-red-500 to-rose-500'
        },
        cancelled: {
            icon: (
                <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
            ),
            label: 'Cancelled',
            color: 'text-slate-400',
            gradient: 'from-slate-500/20 to-slate-600/20',
            borderColor: 'border-slate-500/30',
            progressGradient: 'from-slate-500 to-slate-600'
        },
    };

    const status = statusConfig[jobData.status];

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            {/* Animated Background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${status.gradient} opacity-50`}></div>

            <div className="relative p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-5">
                        {/* Status Icon with Glow */}
                        <div className="relative">
                            <div className={`absolute inset-0 bg-gradient-to-br ${status.gradient} rounded-2xl blur-xl opacity-75`}></div>
                            <div className={`relative w-16 h-16 bg-gradient-to-br ${status.gradient} rounded-2xl flex items-center justify-center border ${status.borderColor}`}>
                                {status.icon}
                            </div>
                        </div>

                        {/* Status Info */}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className={`text-xl font-black ${status.color}`}>
                                    {status.label}
                                </h3>

                                {/* Two-Phase Mode Badge */}
                                {useTwoPhase && currentPhase && jobData.status === 'processing' && (
                                    <span className={`px-3 py-1 text-xs font-bold rounded-lg ${currentPhase === 'collecting'
                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                        }`}>
                                        {currentPhase === 'collecting' ? '📦 Collecting' : '✨ Enriching'}
                                    </span>
                                )}

                                {/* Postal Code Badge */}
                                {usePostalCodes && (
                                    <span className="px-3 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg">
                                        📮 Postal Codes
                                    </span>
                                )}
                            </div>
                            <p className="text-base text-slate-400">
                                <span className="font-bold text-white">{jobData.keyword}</span>
                                {jobData.location && (
                                    <>
                                        <span className="mx-2 text-slate-600">•</span>
                                        <span>{jobData.location}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Connection Status */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${connected
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : 'bg-slate-500/20 border border-slate-500/30'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                            <span className={`text-xs font-bold ${connected ? 'text-emerald-300' : 'text-slate-400'}`}>
                                {connected ? 'Live' : 'Offline'}
                            </span>
                        </div>

                        {/* Cancel Button */}
                        {(jobData.status === 'queued' || jobData.status === 'processing') && (
                            <button
                                onClick={handleCancelJob}
                                disabled={isCancelling}
                                className="group relative overflow-hidden px-5 py-2.5 text-sm font-bold text-red-300 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isCancelling ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Cancelling...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancel
                                    </>
                                )}
                            </button>
                        )}

                        {/* Enrichment Controls (only show during enriching phase) */}
                        {useTwoPhase && currentPhase === 'enriching' && jobData.status === 'processing' && (
                            <>
                                {isEnrichmentPaused ? (
                                    <button
                                        onClick={onResumeEnrichment}
                                        className="px-5 py-2.5 text-sm font-bold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl transition-all flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Resume
                                    </button>
                                ) : (
                                    <button
                                        onClick={onPauseEnrichment}
                                        className="px-5 py-2.5 text-sm font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl transition-all flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Pause
                                    </button>
                                )}

                                <button
                                    onClick={onSkipEnrichment}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-300 bg-slate-500/20 hover:bg-slate-500/30 border border-slate-500/30 rounded-xl transition-all flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Skip
                                </button>
                            </>
                        )}

                        {/* Results Counter */}
                        {jobData.status === 'completed' && (
                            <div className="text-right">
                                <div className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                    {jobData.resultsCount}
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Leads Found
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                {(jobData.status === 'queued' || jobData.status === 'processing') && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400 font-semibold">Progress</span>
                            <span className={`font-black text-lg ${status.color}`}>
                                {jobData.progress}%
                            </span>
                        </div>
                        <div className="relative h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                            <div
                                className={`h-full bg-gradient-to-r ${status.progressGradient} rounded-full transition-all duration-500 relative overflow-hidden`}
                                style={{ width: `${jobData.progress}%` }}
                            >
                                {/* Animated shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                        <p className="text-sm text-center text-slate-400 font-medium">
                            {progressMessage}
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-red-300 mb-1">Error Occurred</p>
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobStatus;