import React from 'react';
import { toast } from 'react-toastify';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error);
        console.error('Error stack:', error.stack);
        console.error('Component stack:', errorInfo.componentStack);

        // Enhanced frame/chrome-error handling
        if (error.message.includes('frame') ||
            error.message.includes('X-Frame-Options') ||
            error.message.includes('Refused to display') ||
            error.message.includes('chrome-error') ||
            error.message.includes('chromewebdata')) {
            console.error('FRAME/CHROME ERROR DETECTED:', {
                message: error.message,
                url: window.location.href,
                userAgent: navigator.userAgent,
                referrer: document.referrer
            });
            toast.error('Browser security restriction detected. Try: 1) Refresh page 2) Disable conflicting extensions 3) Check dev server', {
                position: 'top-center',
                autoClose: false
            });
        }


        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border-4 border-red-100">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
                        <p className="text-gray-600 mb-6">
                            We're sorry, an unexpected error occurred.
                            {this.state.error && (
                                <>
                                    <br />
                                    <code className="bg-gray-100 px-2 py-1 rounded text-sm text-red-600">
                                        {this.state.error.message}
                                    </code>
                                </>
                            )}
                        </p>
                        <div className="space-x-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null, errorInfo: null });
                                }}
                                className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-sm">
                                <summary className="cursor-pointer font-medium mb-2">Debug info (dev only)</summary>
                                <pre className="whitespace-pre-wrap text-xs text-gray-800">
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
