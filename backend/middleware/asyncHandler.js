/**
 * Async Handler - Wraps async route handlers to catch errors automatically
 * 
 * Problem: Every controller needs try-catch to pass errors to Express error middleware.
 * Solution: This wrapper catches rejected promises and passes them to next().
 * 
 * Usage:
 * const asyncHandler = require('../middleware/asyncHandler');
 * 
 * exports.getMedicines = asyncHandler(async (req, res) => {
 *     // No try-catch needed!
 *     const medicines = await Medicine.find({ user: req.user._id });
 *     res.json(medicines);
 * });
 */

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Named export for destructuring, default for require
module.exports = asyncHandler;
