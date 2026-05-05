const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { ValidationError, AuthError } = require('../utils/errors');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ValidationError('An account with this email already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role: 'admin', // New users are always admin by default
    });

    logger.logRequest(req, 'New user registered', { userId: user._id });

    res.status(201).json(responseHandler.created({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
    }, 'Account created successfully'));
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    logger.logRequest(req, 'User logged in', { userId: user._id });

    res.json(responseHandler.success({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
    }, 'Login successful'));
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json(responseHandler.success(user, 'Profile retrieved'));
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res) => {
    const { name, notificationEnabled } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, notificationEnabled },
        { new: true, runValidators: true }
    );

    logger.logRequest(req, 'Profile updated', { userId: user._id });

    res.json(responseHandler.success(user, 'Profile updated successfully'));
});
