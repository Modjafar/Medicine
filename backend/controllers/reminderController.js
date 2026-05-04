const Reminder = require('../models/Reminder');
const asyncHandler = require('../middleware/asyncHandler');
const { NotFoundError, ValidationError } = require('../utils/errors');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * @desc    Get upcoming reminders (next 24 hours)
 * @route   GET /api/reminders/upcoming
 * @access  Private
 */
exports.getUpcomingReminders = asyncHandler(async (req, res) => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const reminders = await Reminder.find({
        user: req.user._id,
        scheduledTime: { $gte: now, $lte: tomorrow },
        status: { $in: ['pending', 'sent', 'snoozed'] },
    })
        .populate('medicine', 'name dosagePerDay unit')
        .sort({ scheduledTime: 1 });

    res.json(responseHandler.success(reminders, 'Upcoming reminders retrieved'));
});

/**
 * @desc    Get today's reminders
 * @route   GET /api/reminders/today
 * @access  Private
 */
exports.getTodayReminders = asyncHandler(async (req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const reminders = await Reminder.find({
        user: req.user._id,
        scheduledTime: { $gte: startOfDay, $lte: endOfDay },
    })
        .populate('medicine', 'name dosagePerDay unit')
        .sort({ scheduledTime: 1 });

    res.json(responseHandler.success(reminders, "Today's reminders retrieved"));
});

/**
 * @desc    Snooze a reminder
 * @route   POST /api/reminders/:id/snooze
 * @access  Private
 */
exports.snoozeReminder = asyncHandler(async (req, res) => {
    const { minutes } = req.body;

    const reminder = await Reminder.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!reminder) {
        throw new NotFoundError('Reminder', 'Reminder not found');
    }

    if (reminder.snoozeCount >= 3) {
        throw new ValidationError('Maximum snooze limit reached (3 times). Please take your medicine.');
    }

    const snoozeUntil = new Date(Date.now() + minutes * 60000);
    reminder.status = 'snoozed';
    reminder.snoozeUntil = snoozeUntil;
    reminder.snoozeCount += 1;
    await reminder.save();

    logger.logRequest(req, 'Reminder snoozed', { reminderId: reminder._id, minutes });

    res.json(responseHandler.success(reminder, `Reminder snoozed for ${minutes} minutes`));
});

/**
 * @desc    Dismiss a reminder (mark as missed)
 * @route   POST /api/reminders/:id/dismiss
 * @access  Private
 */
exports.dismissReminder = asyncHandler(async (req, res) => {
    const reminder = await Reminder.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { status: 'missed' },
        { new: true }
    );

    if (!reminder) {
        throw new NotFoundError('Reminder', 'Reminder not found');
    }

    logger.logRequest(req, 'Reminder dismissed', { reminderId: reminder._id });

    res.json(responseHandler.success(reminder, 'Reminder dismissed'));
});

/**
 * @desc    Get reminder history (taken/missed)
 * @route   GET /api/reminders/history
 * @access  Private
 */
exports.getReminderHistory = asyncHandler(async (req, res) => {
    const reminders = await Reminder.find({
        user: req.user._id,
        status: { $in: ['taken', 'missed'] },
    })
        .populate('medicine', 'name')
        .sort({ scheduledTime: -1 })
        .limit(50);

    res.json(responseHandler.success(reminders, 'Reminder history retrieved'));
});
