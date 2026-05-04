const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Validate Middleware - Request validation using express-validator
 * 
 * Usage in routes:
 * router.post('/register', validate.register, authController.register);
 * 
 * Features:
 * - Validates request body fields
 * - Returns array of validation errors
 * - Reuses consistent error format
 */

// Helper to format validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        throw new ValidationError(errorMessages);
    }

    next();
};

// Validation rules for different routes
const validate = {
    // Auth validations
    register: [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Please provide a valid email address')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
            .matches(/\d/).withMessage('Password must contain at least one number'),
        handleValidationErrors
    ],

    login: [
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Please provide a valid email address'),
        body('password')
            .notEmpty().withMessage('Password is required'),
        handleValidationErrors
    ],

    // Medicine validations
    medicine: [
        body('name')
            .trim()
            .notEmpty().withMessage('Medicine name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Medicine name must be between 2 and 100 characters'),
        body('quantity')
            .notEmpty().withMessage('Quantity is required')
            .isInt({ min: 0 }).withMessage('Quantity must be a positive number'),
        body('dosagePerDay')
            .notEmpty().withMessage('Dosage per day is required')
            .isInt({ min: 1, max: 10 }).withMessage('Dosage must be between 1 and 10 times per day'),
        body('unit')
            .trim()
            .notEmpty().withMessage('Unit is required (e.g., mg, tablet, ml)'),
        body('startDate')
            .notEmpty().withMessage('Start date is required')
            .isISO8601().withMessage('Start date must be a valid date'),
        body('endDate')
            .optional()
            .isISO8601().withMessage('End date must be a valid date'),
        handleValidationErrors
    ],

    // Family member validations
    familyMember: [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
        body('relationship')
            .trim()
            .notEmpty().withMessage('Relationship is required'),
        body('age')
            .optional()
            .isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
        handleValidationErrors
    ],

    // Reminder validations
    reminder: [
        body('medicine')
            .notEmpty().withMessage('Medicine ID is required')
            .isMongoId().withMessage('Invalid medicine ID format'),
        body('time')
            .notEmpty().withMessage('Reminder time is required')
            .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
        handleValidationErrors
    ],

    // Update profile validations
    updateProfile: [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
        body('notificationEnabled')
            .optional()
            .isBoolean().withMessage('Notification enabled must be true or false'),
        handleValidationErrors
    ]
};

module.exports = validate;
