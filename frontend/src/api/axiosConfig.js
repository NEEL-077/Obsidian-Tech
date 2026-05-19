import axios from 'axios';

// Set up default config for axios
const API = axios.create({
    baseURL: '/api', // Use relative URL - works in both dev and production
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercept requests to add token
API.interceptors.request.use((config) => {
    const safeParse = (storageKey) => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    };

    const adminInfo = safeParse('adminInfo');
    const userInfo = safeParse('userInfo');

    const userToken = userInfo?.token || adminInfo?.token;

    if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
    } else {
        delete config.headers.Authorization;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;
