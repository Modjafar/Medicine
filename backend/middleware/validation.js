const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: errors.array(),
            },
        });
    }
    next();
};

const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ max: 50 })
        .withMessage('Name cannot exceed 50 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter and one number'),
    handleValidationErrors,
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors,
];

const addMedicineValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Medicine name is required')
        .isLength({ max: 100 })
        .withMessage('Medicine name cannot exceed 100 characters'),
    body('quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 0 })
        .withMessage('Quantity must be a non-negative integer'),
    body('dosagePerDay')
        .notEmpty()
        .withMessage('Dosage per day is required')
        .isInt({ min: 1 })
        .withMessage('Dosage must be at least 1'),
    body('reminderTimes')
        .isArray({ min: 1 })
        .withMessage('At least one reminder time is required')
        .custom((value) => value.every((t) => /^\d{2}:\d{2}$/.test(t)))
        .withMessage('Reminder times must be in HH:mm format'),
    body('unit')
        .optional()
        .isIn(['tablets', 'capsules', 'ml', 'drops', 'injections', 'patches'])
        .withMessage('Invalid unit'),
    body('instructions')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Instructions cannot exceed 500 characters'),
    handleValidationErrors,
];

const addFamilyMemberValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ max: 50 })
        .withMessage('Name cannot exceed 50 characters'),
    body('relationship')
        .notEmpty()
        .withMessage('Relationship is required')
        .isIn(['spouse', 'child', 'parent', 'sibling', 'grandparent', 'other'])
        .withMessage('Invalid relationship'),
    body('age')
        .optional()
        .isInt({ min: 0, max: 150 })
        .withMessage('Age must be between 0 and 150'),
    body('medicalNotes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Medical notes cannot exceed 1000 characters'),
    handleValidationErrors,
];

module.exports = {
    registerValidation,
    loginValidation,
    addMedicineValidation,
    addFamilyMemberValidation,
    handleValidationErrors,
};

