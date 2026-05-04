import { useState, useCallback, useEffect } from 'react';

/**
 * useApi - Reusable API hook with loading/error/data states
 * 
 * Handles API calls with automatic loading states and error handling.
 * Supports both immediate execution and manual execution.
 * 
 * @param {function} apiFunction - Async API function to call
 * @param {boolean} immediate - Whether to call immediately on mount
 * @param {array} deps - Dependencies for immediate execution
 * 
 * @returns {object} {
 *   data,           // Response data
 *   loading,        // Whether request is in progress
 *   error,          // Error object or null
 *   errorMessage,   // User-friendly error message string
 *   execute,        // Function to manually trigger the API call
 *   reset,          // Reset all states
 *   setData         // Manually set data
 * }
 * 
 * Usage - Manual execution:
 *   const { execute, loading, error, data } = useApi(loginApi);
 *   const handleSubmit = async (values) => {
 *     await execute(values.email, values.password);
 *   };
 * 
 * Usage - Immediate execution:
 *   const { data: medicines, loading, error } = useApi(
 *     () => api.get('/medicines'),
 *     true,
 *     []
 *   );
 */
const useApi = (apiFunction, immediate = false, deps = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    /**
     * Get user-friendly error message from various error types
     */
    const getErrorMessage = useCallback((err) => {
        if (!err) return null;

        // Network error (no response from server)
        if (!err.response && err.request) {
            return 'Network error. Please check your internet connection and try again.';
        }

        // Server returned an error response
        if (err.response) {
            const { status, data: responseData } = err.response;

            // Use server-provided message if available
            if (responseData?.message) {
                return responseData.message;
            }
            if (responseData?.error?.message) {
                return responseData.error.message;
            }

            // Fallback messages by status code
            const statusMessages = {
                400: 'Invalid request. Please check your input.',
                401: 'Your session has expired. Please log in again.',
                403: 'You do not have permission to perform this action.',
                404: 'The requested resource was not found.',
                409: 'This action conflicts with existing data.',
                422: 'Validation failed. Please check your input.',
                429: 'Too many requests. Please wait a moment and try again.',
                500: 'Server error. Please try again later.',
                502: 'Service temporarily unavailable. Please try again later.',
                503: 'Service temporarily unavailable. Please try again later.',
            };

            return statusMessages[status] || `An error occurred (status ${status})`;
        }

        // Unknown error
        return err.message || 'An unexpected error occurred. Please try again.';
    }, []);

    /**
     * Execute the API function
     */
    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFunction(...args);
            const responseData = response?.data ?? response;
            setData(responseData);
            return responseData;
        } catch (err) {
            const friendlyMessage = getErrorMessage(err);

            setError({
                ...err,
                friendlyMessage,
                isNetworkError: !err.response && !!err.request,
                isServerError: err.response?.status >= 500,
                statusCode: err.response?.status,
            });

            throw err; // Re-throw for outer handler
        } finally {
            setLoading(false);
        }
    }, [apiFunction, getErrorMessage]);

    /**
     * Reset all states
     */
    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    /**
     * Auto-execute on mount if immediate is true
     */
    useEffect(() => {
        if (immediate) {
            execute();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    const errorMessage = error?.friendlyMessage || null;

    return {
        data,
        loading,
        error,
        errorMessage,
        execute,
        reset,
        setData,
    };
};

export default useApi;
