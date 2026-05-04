const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthError } = require('../utils/errors');
const logger = require('../utils/logger');


const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return next(new AuthError('User not found. Please log in again.', 'USER_NOT_FOUND'));
            }

            return next();
        } catch (error) {
            logger.error('Auth middleware error:', {
                error: error.message,
                name: error.name
            });

            if (error.name === 'TokenExpiredError') {
                return next(new AuthError('Your session has expired. Please log in again.', 'TOKEN_EXPIRED'));
            }
            if (error.name === 'JsonWebTokenError') {
                return next(new AuthError('Invalid token. Please log in again.', 'INVALID_TOKEN'));
            }

            return next(new AuthError('Not authorized, token failed', 'TOKEN_FAILED'));
        }
    }

    if (!token) {
        return next(new AuthError('Not authorized, no token provided', 'NO_TOKEN'));
    }
};


module.exports = { protect };
