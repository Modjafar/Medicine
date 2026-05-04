const AppError = require('./AppError');

/**
 * NotFoundError - For resources that don't exist (404 Not Found)
 * 
 * Used when:
 * - Medicine not found
 * - User not found  
 * - Family member not found
 * - Reminder not found
 * 
 * @example
 * throw new NotFoundError('Medicine', 'Medicine with ID 123 not found');
 * throw new NotFoundError('User'); // defaults to "User not found"
 */
class NotFoundError extends AppError {
    constructor(resource = 'Resource', message) {
        const displayMessage = message || `${resource} not found`;
        super(displayMessage, 404, 'NOT_FOUND');
        this.resource = resource;
    }
}

module.exports = NotFoundError;
