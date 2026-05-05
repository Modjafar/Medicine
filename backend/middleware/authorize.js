const Medicine = require('../models/Medicine');
const Reminder = require('../models/Reminder');
const FamilyMember = require('../models/FamilyMember');
const History = require('../models/History');
const asyncHandler = require('./asyncHandler');
const { ValidationError, NotFoundError, AppError } = require('../utils/errors');

/**
 * @desc    Require specific role(s)
 * @param   {...string} allowedRoles - Role(s) to allow (e.g., 'admin' or 'admin', 'family')
 */
exports.requireRole = (...allowedRoles) => {
    return asyncHandler(async (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            throw new AppError(
                `Access denied. Required role: ${allowedRoles.join(' or ')}`,
                403,
                'FORBIDDEN'
            );
        }
        next();
    });
};

/**
 * @desc    Check if user owns the medicine (for admin) or has it assigned (for family)
 */
exports.checkMedicineAccess = asyncHandler(async (req, res, next) => {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
        throw new NotFoundError('Medicine', 'Medicine not found');
    }

    // Admin: check ownership
    if (req.user.role === 'admin') {
        if (medicine.user.toString() !== req.user._id.toString()) {
            throw new AppError('Not authorized to access this medicine', 403, 'FORBIDDEN');
        }
    }
    // Family member: check assignment
    else if (req.user.role === 'family') {
        if (medicine.assignedTo?.toString() !== req.user._id.toString()) {
            throw new AppError('This medicine is not assigned to you', 403, 'FORBIDDEN');
        }
    }

    req.medicine = medicine;
    next();
});

/**
 * @desc    Admin-only access (denies family members)
 */
exports.adminOnly = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        throw new AppError('This action is only available to administrators', 403, 'FORBIDDEN');
    }
    next();
});

/**
 * @desc    Family member can only access their own notifications
 */
exports.checkNotificationAccess = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
        throw new NotFoundError('Notification', 'Notification not found');
    }

    if (notification.user.toString() !== req.user._id.toString()) {
        throw new AppError('Not authorized to access this notification', 403, 'FORBIDDEN');
    }

    req.notification = notification;
    next();
});

/**
 * @desc    Check family member ownership
 */
exports.checkFamilyMemberAccess = asyncHandler(async (req, res, next) => {
    const member = await FamilyMember.findById(req.params.id);
    if (!member) {
        throw new NotFoundError('Family member', 'Family member not found');
    }

    if (member.user.toString() !== req.user._id.toString()) {
        throw new AppError('Not authorized to access this family member', 403, 'FORBIDDEN');
    }

    req.familyMember = member;
    next();
});

/**
 * @desc    Check reminder ownership
 */
exports.checkReminderAccess = asyncHandler(async (req, res, next) => {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
        throw new NotFoundError('Reminder', 'Reminder not found');
    }

    if (reminder.user.toString() !== req.user._id.toString()) {
        throw new AppError('Not authorized to access this reminder', 403, 'FORBIDDEN');
    }

    req.reminder = reminder;
    next();
});
