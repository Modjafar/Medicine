import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';

const SessionWarning = () => {
    const { tokenExpiry } = useAuth();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(0);
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    useEffect(() => {
        if (!tokenExpiry) return;

        const interval = setInterval(() => {
            const remaining = Math.ceil((tokenExpiry - Date.now()) / 1000);
            setCountdown(remaining);
        }, 1000);

        return () => clearInterval(interval);
    }, [tokenExpiry]);

    if (!tokenExpiry || countdown > 300) return null; // Show only in last 5 minutes

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return (
        <div className="fixed bottom-4 right-4 left-4 md:right-8 md:left-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-xl shadow-2xl z-50 border-2 border-yellow-300">
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                <div className="flex items-center gap-2">
                    <Clock size={20} />
                    <span className="font-bold text-lg">{minutes}:{seconds.toString().padStart(2, '0')}</span>
                </div>
                <div className="text-sm md:text-base font-medium">
                    Your session expires soon. Save your work.
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-1 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg font-medium hover:bg-white/30 transition-all text-sm"
                >
                    <LogOut size={16} />
                    Logout now
                </button>
            </div>
        </div>
    );
};

export default SessionWarning;

