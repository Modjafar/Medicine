import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Axios instance with default configuration
 */
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

/**
 * Request interceptor - attach auth token
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Request configuration error (rare)
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - handle errors globally
 */
api.interceptors.response.use(
    (response) => {
        // Unwrap standard API response format: { success, message, data }
        if (response.data && typeof response.data === 'object' && response.data.success === true && 'data' in response.data) {
            const payload = response.data.data;
            if (payload === null || payload === undefined) {
                response.data = payload;
            } else if (Array.isArray(payload)) {
                response.data = payload;
            } else if (typeof payload === 'object') {
                response.data = { ...payload, message: response.data.message };
            } else {
                response.data = payload;
            }
        }
        return response;
    },
    (error) => {

        // Handle request timeout
        if (error.code === 'ECONNABORTED') {
            error.friendlyMessage = 'Request timed out. Please check your connection and try again.';
            return Promise.reject(error);
        }

        // Handle network errors (no response from server)
        if (!error.response) {
            error.friendlyMessage = 'Network error. Please check your internet connection and try again.';
            return Promise.reject(error);
        }

        const { status, data } = error.response;

        // Handle specific status codes with user-friendly messages
        switch (status) {
            case 400:
                error.friendlyMessage = data?.message || data?.error?.message || 'Invalid request. Please check your input.';
                break;
            case 401:
                // Token expired or invalid - clear auth and redirect
                error.friendlyMessage = data?.message || 'Your session has expired. Please log in again.';
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Delay redirect slightly to allow error to be displayed
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
                break;
            case 403:
                error.friendlyMessage = data?.message || 'You do not have permission to perform this action.';
                break;
            case 404:
                error.friendlyMessage = data?.message || 'The requested resource was not found.';
                break;
            case 409:
                error.friendlyMessage = data?.message || 'This action conflicts with existing data.';
                break;
            case 422:
                error.friendlyMessage = data?.message || 'Validation failed. Please check your input.';
                break;
            case 429:
                error.friendlyMessage = data?.message || 'Too many requests. Please wait a moment and try again.';
                break;
            case 500:
                error.friendlyMessage = data?.message || 'Server error. Please try again later.';
                break;
            case 502:
            case 503:
                error.friendlyMessage = data?.message || 'Service temporarily unavailable. Please try again later.';
                break;
            default:
                error.friendlyMessage = data?.message || `An unexpected error occurred (${status}).`;
        }

        // Add structured error info for useApi hook
        error.isNetworkError = false;
        error.isServerError = status >= 500;
        error.statusCode = status;

        return Promise.reject(error);
    }
);

/**
 * Retry wrapper for idempotent requests
 * Automatically retries failed network requests up to 2 times
 * 
 * @param {function} requestFn - Async function that makes the request
 * @param {number} retries - Number of retry attempts
 */
export const retryRequest = async (requestFn, retries = 2) => {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            lastError = error;

            // Only retry on network errors or 5xx server errors
            const shouldRetry = !error.response || (error.response?.status >= 500 && error.response?.status !== 501);

            if (!shouldRetry || attempt === retries) {
                throw error;
            }

            // Exponential backoff: wait 1s, then 2s
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
};

export default api;
