/**
 * Error Exports - Centralized access to all custom errors
 * 
 * Usage:
 * const { AppError, ValidationError, AuthError, NotFoundError, DatabaseError } = require('../utils/errors');
 * 
 * Or specific:
 * const ValidationError = require('../utils/errors/ValidationError');
 */

module.exports = {
    AppError: require('./AppError'),
    ValidationError: require('./ValidationError'),
    AuthError: require('./AuthError'),
    NotFoundError: require('./NotFoundError'),
    DatabaseError: require('./DatabaseError')
};
