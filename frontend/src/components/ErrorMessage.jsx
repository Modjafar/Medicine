import React from 'react';
import { AlertCircle, X } from 'lucide-react';

/**
 * ErrorMessage - Reusable inline error display
 * 
 * @param {string} message - Error message to display
 * @param {function} onDismiss - Optional callback to dismiss the error
 * @param {string} variant - 'inline' | 'banner' | 'toast' - Display style
 * @param {string} className - Additional CSS classes
 * 
 * Usage:
 *   <ErrorMessage message="Invalid email format" />
 *   <ErrorMessage message="Something went wrong" variant="banner" onDismiss={clearError} />
 */
const ErrorMessage = ({
    message,
    onDismiss = null,
    variant = 'inline',
    className = ''
}) => {
    if (!message) return null;

    const variants = {
        inline: 'text-red-600 text-sm flex items-center gap-1.5 mt-1',
        banner: 'bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3',
        toast: 'bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3',
    };

    const iconSizes = {
        inline: 14,
        banner: 20,
        toast: 20,
    };

    return (
        <div
            className={`${variants[variant] || variants.inline} ${className}`}
            role="alert"
            aria-live="polite"
        >
            <AlertCircle size={iconSizes[variant] || 14} className="flex-shrink-0" />
            <span className="flex-1">{message}</span>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 hover:opacity-70 transition-opacity"
                    aria-label="Dismiss error"
                >
                    <X size={iconSizes[variant] || 14} />
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
