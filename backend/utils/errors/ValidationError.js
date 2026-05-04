const AppError = require('./AppError');

/**
 * ValidationError - For invalid input data (400 Bad Request)
 * 
 * Used when form data doesn't pass validation rules.
 * 
 * @example
 * throw new ValidationError('Email is required');
 * throw new ValidationError(['Email is invalid', 'Password is too short']);
 */
class ValidationError extends AppError {
    constructor(message) {
        // If message is an array, it's multiple validation errors
        const isMultiple = Array.isArray(message);
        const displayMessage = isMultiple
            ? 'Validation failed'
            : message;

        super(displayMessage, 400, 'VALIDATION_ERROR');

        this.errors = isMultiple ? message : [message];
        this.isValidationError = true;
    }
}

module.exports = ValidationError;
