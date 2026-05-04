const winston = require('winston');
const path = require('path');

/**
 * Winston Logger Configuration
 * 
 * Features:
 * - Console output with colors in development
 * - File output for errors and combined logs
 * - JSON format in production for log aggregation
 * - Timestamps on all logs
 * - Separate error log file
 * 
 * Usage:
 * const logger = require('./utils/logger');
 * logger.info('User registered', { userId: '123' });
 * logger.error('Database connection failed', { error: err.message });
 */

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for development: readable with colors
const devFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
        msg += ` | ${JSON.stringify(metadata)}`;
    }

    // Add stack trace for errors
    if (stack) {
        msg += `\n${stack}`;
    }

    return msg;
});

// Determine log level based on environment
const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Determine format based on environment
const format = process.env.NODE_ENV === 'production'
    ? combine(
        timestamp(),
        json(),
        errors({ stack: true })
    )
    : combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        devFormat,
        errors({ stack: true })
    );

// File transports (only in production or if LOG_TO_FILE is set)
const fileTransports = [];
if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
    fileTransports.push(
        // Error log file
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Combined log file
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    );
}

// Create the logger
const logger = winston.createLogger({
    level,
    format,
    defaultMeta: {
        service: 'meditrack-api',
        environment: process.env.NODE_ENV || 'development'
    },
    transports: [
        // Always log to console
        new winston.transports.Console({
            stderrLevels: ['error', 'critical'],
        }),
        ...fileTransports
    ],
    // Don't exit on uncaught errors (we handle that separately)
    exitOnError: false,
});

// Stream for Morgan HTTP logging
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// Helper methods with request context
logger.logRequest = (req, message, meta = {}) => {
    logger.info(message, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?._id,
        ...meta
    });
};

logger.logError = (err, req = null, meta = {}) => {
    const logData = {
        errorCode: err.errorCode || 'UNKNOWN',
        statusCode: err.statusCode || 500,
        isOperational: err.isOperational || false,
        ...meta
    };

    if (req) {
        logData.method = req.method;
        logData.url = req.originalUrl;
        logData.ip = req.ip;
        logData.userId = req.user?._id;
    }

    if (err.stack) {
        logData.stack = err.stack;
    }

    logger.error(err.message, logData);
};

module.exports = logger;
