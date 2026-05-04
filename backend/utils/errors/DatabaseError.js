const AppError = require('./AppError');

/**
 * DatabaseError - For MongoDB and database failures (500 Internal Server Error)
 * 
 * Used when:
 * - Duplicate key (E11000) - e.g., email already exists
 * - CastError - invalid ObjectId format
 * - Connection timeout
 * - Write failures
 * 
 * @example
 * // Mongoose duplicate key
 * throw new DatabaseError('Email already registered', 'DUPLICATE_KEY', 409);
 * 
 * // Invalid ObjectId
 * throw new DatabaseError('Invalid ID format', 'INVALID_OBJECT_ID', 400);
 */
class DatabaseError extends AppError {
    constructor(message, errorCode = 'DATABASE_ERROR', statusCode = 500) {
        super(message, statusCode, errorCode);
    }
}

module.exports = DatabaseError;
