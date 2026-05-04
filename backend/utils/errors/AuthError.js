const AppError = require('./AppError');

/**
 * AuthError - For authentication failures (401 Unauthorized)
 * 
 * Used when:
 * - No token provided
 * - Invalid token
 * - Token expired
 * - Invalid credentials
 * 
 * @example
 * throw new AuthError('Invalid email or password');
 * throw new AuthError('Token has expired', 'TOKEN_EXPIRED');
 */
class AuthError extends AppError {
    constructor(message, errorCode = 'AUTH_ERROR') {
        super(message, 401, errorCode);
    }
}

module.exports = AuthError;
