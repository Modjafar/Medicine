import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext(null);

/**
 * Helper to extract data from response (handles both old and new response formats)
 * New format: { success: true, message: "...", data: { ... } }
 * Old format: { ...data directly }
 */
const extractData = (response) => {
    return response.data?.data || response.data;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/profile');
                    const userData = extractData(response);
                    setUser(userData);
                } catch (error) {
                    // 401 errors are handled by api interceptor (clears token + redirects)
                    // For other errors, just clear auth state gracefully
                    console.error('Auth initialization error:', error.message);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const data = extractData(response);
        const { token, ...userData } = data;

        if (!token) {
            throw new Error('Authentication failed: No token received from server');
        }

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const register = async (name, email, password) => {
        const response = await api.post('/auth/register', { name, email, password });
        const data = extractData(response);
        const { token, ...userData } = data;

        if (!token) {
            throw new Error('Registration failed: No token received from server');
        }

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.info('You have been logged out successfully');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
