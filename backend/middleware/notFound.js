const { NotFoundError } = require('../utils/errors');

/**
 * Not Found Handler - Catches requests to undefined routes
 * 
 * This should be the LAST middleware before the global error handler.
 * If a request reaches here, no route matched it.
 * 
 * Usage in server.js (before error handler):
 * app.use(notFound);
 */

const notFound = (req, res, next) => {
    const error = new NotFoundError(
        'Route',
        `Cannot ${req.method} ${req.originalUrl}. This route does not exist.`
    );
    next(error);
};

module.exports = notFound;
