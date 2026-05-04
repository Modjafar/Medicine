const rateLimit = require('express-rate-limit');

/**
 * Rate Limiters - Protect API from abuse and brute force attacks
 * 
 * Different limits for different endpoints:
 * - General API: 100 requests per 15 minutes
 * - Auth endpoints: 5 requests per 15 minutes (prevent brute force)
 * - Strict: 3 requests per hour (for sensitive operations)
 */

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP. Please try again after 15 minutes.'
        }
    },
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    }
});

// Auth endpoints rate limiter (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login/register attempts per 15 minutes
    skipSuccessfulRequests: true, // Don't count successful logins
    message: {
        success: false,
        error: {
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            message: 'Too many authentication attempts. Please try again after 15 minutes.'
        }
    },
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    }
});

// Medicine creation/update limiter
const medicineLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // 30 medicine operations per hour
    message: {
        success: false,
        error: {
            code: 'MEDICINE_RATE_LIMIT_EXCEEDED',
            message: 'Too many medicine operations. Please try again later.'
        }
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    medicineLimiter
};
