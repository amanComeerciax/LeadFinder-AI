import axios from 'axios';

const API_URL = 'http://localhost:5000/api/business';

// Original synchronous search
const searchBusinesses = async (keyword, location, token = null, refresh = false) => {
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(
        `${API_URL}/search`,
        {
            keyword,
            location,
            refresh,
        },
        {
            headers,
        }
    );
    return response.data;
};

// New async job-based search
const createSearchJob = async (keyword, location, token = null, refresh = false) => {
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(
        `${API_URL}/search/job`,
        {
            keyword,
            location,
            refresh,
        },
        {
            headers,
        }
    );
    return response.data;
};

const getJobStatus = async (jobId) => {
    const response = await axios.get(`${API_URL}/job/${jobId}`);
    return response.data;
};

const getSearchHistory = async (limit = 5, token = null) => {
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_URL}/history`, {
        params: { limit },
        headers,
    });
    return response.data;
};

const cancelJob = async (jobId, token = null) => {
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.delete(`${API_URL}/job/${jobId}`, {
        headers,
    });
    return response.data;
};

const deleteSearchHistory = async (historyId, token = null) => {
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.delete(`${API_URL}/history/${historyId}`, {
        headers,
    });
    return response.data;
};

// Two-phase search (new - with postal codes)
const createTwoPhaseSearchJob = async (keyword, location, token = null, refresh = false) => {
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(
        `${API_URL}/search/two-phase`,
        {
            keyword,
            location,
            refresh,
        },
        {
            headers,
        }
    );
    return response.data;
};

// Pause active phase
const pauseEnrichment = async (jobId, token = null) => {
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(
        `${API_URL}/job/${jobId}/pause`,
        {},
        {
            headers,
        }
    );
    return response.data;
};

// Resume active phase
const resumeEnrichment = async (jobId, token = null) => {
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(
        `${API_URL}/job/${jobId}/resume`,
        {},
        {
            headers,
        }
    );
    return response.data;
};

// Skip active phase
const skipEnrichment = async (jobId, token = null) => {
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(
        `${API_URL}/job/${jobId}/skip-enrichment`,
        {},
        {
            headers,
        }
    );
    return response.data;
};

const getActiveJobs = async (token = null) => {
    const headers = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_URL}/jobs/active`, {
        headers,
    });
    return response.data;
};

export {
    searchBusinesses,
    createSearchJob,
    createTwoPhaseSearchJob,
    pauseEnrichment,
    resumeEnrichment,
    skipEnrichment,
    getSearchHistory,
    deleteSearchHistory,
    cancelJob,
    getActiveJobs,
    getJobStatus
};

