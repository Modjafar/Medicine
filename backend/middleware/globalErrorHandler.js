const AppError = require('../utils/errors/AppError');
const DatabaseError = require('../utils/errors/DatabaseError');
const logger = require('../utils/logger');

/**
 * Global Error Handler - Central error processing for Express
 * 
 * This middleware catches ALL errors from:
 * - asyncHandler (rejected promises)
 * - sync route handlers
 * - next(err) calls
 * 
 * Features:
 * 1. MongoDB-specific error handling (duplicate keys, invalid ObjectId, validation)
 * 2. JWT-specific error handling (expired, malformed)
 * 3. Operational vs programming error distinction
 * 4. Hides stack traces and details in production
 * 5. Consistent JSON response format
 * 6. Professional logging
 * 
 * Response format:
 * {
 *   success: false,
 *   error: {
 *     code: 'ERROR_CODE',
 *     message: 'User-friendly message',
 *     ...(dev only) stack: '...'
 *   }
 * }
 */

// Handle specific MongoDB errors
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}. Please provide a valid ID.`;
    return new DatabaseError(message, 'INVALID_OBJECT_ID', 400);
};

const handleDuplicateFieldsDB = (err) => {
    // Extract the duplicate field value
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `An account with this ${field} already exists. Please use a different ${field}.`;
    return new DatabaseError(message, 'DUPLICATE_FIELD', 409);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new DatabaseError(message, 'MONGOOSE_VALIDATION_ERROR', 400);
};

// Handle specific JWT errors
const handleJWTError = () => {
    return new (require('../utils/errors/AuthError'))('Invalid token. Please log in again.', 'INVALID_TOKEN');
};

const handleJWTExpiredError = () => {
    return new (require('../utils/errors/AuthError'))('Your session has expired. Please log in again.', 'TOKEN_EXPIRED');
};


// Send error response based on environment
const sendError = (err, req, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.errorCode,
                message: err.message,
                ...(err.errors && { errors: err.errors }), // For validation arrays
            }
        });
    }

    // Programming or unknown error: don't leak details
    logger.error('UNEXPECTED ERROR:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
    });

    return res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'Something went wrong. Please try again later.'
                : err.message,
        }
    });
};

// Send detailed error in development
const sendErrorDev = (err, req, res) => {
    logger.error('Error:', {
        message: err.message,
        errorCode: err.errorCode,
        statusCode: err.statusCode,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
    });

    return res.status(err.statusCode || 500).json({
        success: false,
        error: {
            code: err.errorCode || 'UNKNOWN_ERROR',
            message: err.message,
            statusCode: err.statusCode,
            isOperational: err.isOperational,
            stack: err.stack,
        }
    });
};

// Main error handler middleware
const globalErrorHandler = (err, req, res, next) => {
    // Set defaults
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log all errors
    logger.logError(err, req);

    // Transform known MongoDB errors into operational errors
    let error = { ...err, message: err.message };

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // Send response based on environment
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, req, res);
    } else {
        sendError(error, req, res);
    }
};

module.exports = globalErrorHandler;
