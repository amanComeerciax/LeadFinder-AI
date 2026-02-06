import React, { useState, useEffect } from 'react';
import { getActiveJobs, cancelJob, pauseEnrichment, resumeEnrichment } from '../api/business.api';
import { useAuth } from '@clerk/clerk-react';

const ActiveJobs = () => {
    const [activeJobs, setActiveJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    const fetchActiveJobs = async () => {
        try {
            const token = await getToken();
            const response = await getActiveJobs(token);
            if (response.success) {
                setActiveJobs(response.data);
            }
        } catch (error) {
            console.error('Error fetching active jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveJobs();
        // Poll every 5 seconds for updates
        const interval = setInterval(fetchActiveJobs, 5000);
        return () => clearInterval(interval);
    }, []);

    const handlePause = async (jobId) => {
        try {
            const token = await getToken();
            const response = await pauseEnrichment(jobId, token);
            if (response.success) {
                setActiveJobs(prev => prev.map(job =>
                    job.jobId === jobId ? { ...job, isPaused: true } : job
                ));
            }
        } catch (error) {
            console.error('Error pausing job:', error);
        }
    };

    const handleResume = async (jobId) => {
        try {
            const token = await getToken();
            const response = await resumeEnrichment(jobId, token);
            if (response.success) {
                setActiveJobs(prev => prev.map(job =>
                    job.jobId === jobId ? { ...job, isPaused: false } : job
                ));
            }
        } catch (error) {
            console.error('Error resuming job:', error);
        }
    };

    const handleCancel = async (jobId) => {
        if (!window.confirm('Are you sure you want to cancel this background process?')) return;

        try {
            const token = await getToken();
            const response = await cancelJob(jobId, token);
            if (response.success) {
                // Remove job from local state immediately
                setActiveJobs(prev => prev.filter(job => job.jobId !== jobId));
            }
        } catch (error) {
            console.error('Error cancelling job:', error);
            alert('Failed to cancel the process.');
        }
    };

    if (loading && activeJobs.length === 0) {
        return <div className="p-4 text-center">Loading active processes...</div>;
    }

    if (activeJobs.length === 0) {
        return null; // Don't show anything if no active jobs
    }

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl backdrop-blur-xl mb-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500 rounded-full blur-sm opacity-50 animate-pulse"></div>
                        <div className="relative w-3 h-3 bg-cyan-400 rounded-full"></div>
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                        Background Scrapers
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase border border-cyan-500/30">
                        {activeJobs.length} Active
                    </span>
                </div>
            </div>

            {/* Jobs List */}
            <div className="divide-y divide-white/5">
                {activeJobs.map(job => (
                    <div key={job.jobId} className="p-6 hover:bg-white/5 transition-all group">
                        <div className="flex justify-between items-start gap-6">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-base font-black text-white truncate">
                                        {job.keyword}
                                    </h4>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-sm font-bold text-slate-400 truncate">
                                        {job.location}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-tight">
                                            Scraping Running
                                        </span>
                                    </div>
                                    <span className="text-slate-700">|</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                                        {job.phase === 'enriching' ? '✨ Enriching' : '📦 Collecting'}
                                    </span>
                                </div>
                            </div>

                            {job.isPaused ? (
                                <button
                                    onClick={() => handleResume(job.jobId)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all font-black uppercase text-xs"
                                    title="Resume Processing"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    </svg>
                                    Resume
                                </button>
                            ) : (
                                <button
                                    onClick={() => handlePause(job.jobId)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all font-black uppercase text-xs"
                                    title="Pause Processing"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Pause
                                </button>
                            )}

                            <button
                                onClick={() => handleCancel(job.jobId)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all group/btn"
                                title="Remove / Stop Scraping"
                            >
                                <svg className="w-4 h-4 transition-transform group-hover/btn:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-xs font-black uppercase">Remove</span>
                            </button>
                        </div>

                        {/* Progress Section */}
                        <div className="mt-4">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    Progress
                                </span>
                                <span className="text-sm font-black text-cyan-400">
                                    {Math.round(job.progress || 0)}%
                                </span>
                            </div>
                            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${job.progress || 0}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">
                                    {job.resultsCount || 0} Leads Found
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">
                                    PID: {job.jobId.slice(0, 8)}...
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActiveJobs;
