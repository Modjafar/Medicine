const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let errorCode = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';

    if (err.name === 'ValidationError') {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        message = Object.values(err.errors).map((val) => val.message).join(', ');
    } else if (err.name === 'CastError') {
        statusCode = 400;
        errorCode = 'INVALID_ID';
        message = `Invalid ${err.path}: ${err.value}`;
    } else if (err.code === 11000) {
        statusCode = 409;
        errorCode = 'DUPLICATE_ERROR';
        message = 'Duplicate field value entered';
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        errorCode = 'INVALID_TOKEN';
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        errorCode = 'TOKEN_EXPIRED';
        message = 'Token expired';
    } else if (err.statusCode) {
        statusCode = err.statusCode;
        errorCode = err.errorCode || 'UNKNOWN_ERROR';
        message = err.message;
    }

    console.error(`[Error] ${statusCode} - ${errorCode}: ${err.message || message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};

module.exports = errorHandler;

