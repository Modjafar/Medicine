import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="mb-4">
                            <svg
                                className="mx-auto h-16 w-16 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 mb-6">
                            An unexpected error has occurred. Please try refreshing the page or go back to the dashboard.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <pre className="mt-6 text-left text-xs bg-gray-100 p-4 rounded overflow-auto text-red-600">
                                {this.state.error.toString()}
                            </pre>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

