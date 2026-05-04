import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);

// Global error handlers to prevent Chrome error page crashes
window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.error('Global unhandled error:', { message: msg, url, line: lineNo, column: columnNo, error: error });
    // Prevent default browser error page (Chrome error page)
    return true;
};

window.addEventListener('unhandledrejection', function (event) {
    console.error('Global unhandled promise rejection:', event.reason);
    // Prevent default handling
    event.preventDefault();
});
