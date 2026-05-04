/**
 * AppError - Base custom error class for the application
 * 
 * This is the foundation of our error handling system.
 * All other custom errors extend this class.
 * 
 * @example
 * throw new AppError('Something went wrong', 500, 'SERVER_ERROR');
 */
class AppError extends Error {
    constructor(message, statusCode, errorCode = 'INTERNAL_ERROR') {
        super(message);
        
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Distinguishes operational errors from programming bugs

        // Captures the stack trace, excluding the constructor call
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
