import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Home, ArrowLeft } from 'lucide-react';

/**
 * NotFound - 404 Page Not Found component
 * 
 * Displays when a user navigates to a non-existent route.
 * Provides navigation back to dashboard or home.
 */
const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Pill className="text-primary-600" size={40} />
                </div>
                
                <h1 className="text-6xl font-bold text-gray-200 mb-2">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h2>
                <p className="text-gray-600 mb-8">
                    Sorry, we couldn't find the page you're looking for. 
                    It might have been moved or doesn't exist.
                </p>

                <div className="space-y-3">
                    <Link
                        to="/"
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                        <Home size={18} />
                        Back to Dashboard
                    </Link>
                    
                    <button
                        onClick={() => window.history.back()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>

                <p className="mt-6 text-sm text-gray-500">
                    If you believe this is an error, please contact support.
                </p>
            </div>
        </div>
    );
};

export default NotFound;
