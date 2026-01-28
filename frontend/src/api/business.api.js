import axios from 'axios';

const API_URL = 'http://localhost:5000/api/business';

// Original synchronous search
const searchBusinesses = async (keyword, location, token = null) => {
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(
        `${API_URL}/search`,
        {
            keyword,
            location,
        },
        {
            headers,
        }
    );
    return response.data;
};

// New async job-based search
const createSearchJob = async (keyword, location, token = null) => {
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(
        `${API_URL}/search/job`,
        {
            keyword,
            location,
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

export { searchBusinesses, createSearchJob, getJobStatus, getSearchHistory };
