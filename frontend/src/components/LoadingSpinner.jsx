import React from 'react';

/**
 * LoadingSpinner - Reusable loading indicator
 * 
 * @param {boolean} fullScreen - Whether to center in full viewport height
 * @param {string} size - 'sm' | 'md' | 'lg' - Spinner size
 * @param {string} text - Optional loading text
 * @param {string} className - Additional CSS classes
 * 
 * Usage:
 *   <LoadingSpinner fullScreen text="Loading your medicines..." />
 *   <LoadingSpinner size="sm" />
 */
const LoadingSpinner = ({
    fullScreen = false,
    size = 'md',
    text = null,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    const spinnerClasses = `
        inline-block rounded-full border-current border-t-transparent
        animate-spin text-primary-600
        ${sizeClasses[size] || sizeClasses.md}
    `;

    const content = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div className={spinnerClasses} role="status" aria-label="Loading">
                <span className="sr-only">Loading...</span>
            </div>
            {text && (
                <p className="text-gray-600 text-sm font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                {content}
            </div>
        );
    }

    return content;
};

export default LoadingSpinner;
