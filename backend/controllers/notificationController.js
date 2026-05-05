const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const { NotFoundError, ValidationError } = require('../utils/errors');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * @desc    Get all notifications for user
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = asyncHandler(async (req, res) => {
    const { unreadOnly } = req.query;

    const query = { user: req.user._id };
    if (unreadOnly === 'true') {
        query.isRead = false;
    }

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50);

    res.json(responseHandler.success(notifications, 'Notifications retrieved successfully'));
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id
 * @access  Private
 */
exports.markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        throw new NotFoundError('Notification', 'Notification not found');
    }

    logger.logRequest(req, 'Notification marked as read', { notificationId: notification._id });

    res.json(responseHandler.success(notification, 'Notification marked as read'));
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/mark-all-read
 * @access  Private
 */
exports.markAllAsRead = asyncHandler(async (req, res) => {
    const result = await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true }
    );

    logger.logRequest(req, 'All notifications marked as read', { modifiedCount: result.modifiedCount });

    res.json(responseHandler.success(
        { markedCount: result.modifiedCount },
        'All notifications marked as read'
    ));
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!notification) {
        throw new NotFoundError('Notification', 'Notification not found');
    }

    logger.logRequest(req, 'Notification deleted', { notificationId: req.params.id });

    res.json(responseHandler.deleted('Notification deleted successfully'));
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/count/unread
 * @access  Private
 */
exports.getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
        user: req.user._id,
        isRead: false,
    });

    res.json(responseHandler.success({ unreadCount: count }, 'Unread count retrieved'));
});

/**
 * @desc    Internal - Create notification
 * (Not exposed as API route, used internally by controllers)
 */
exports.createNotification = async (userId, type, title, message, relatedId, relatedModel) => {
    try {
        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message,
            relatedId,
            relatedModel,
        });
        return notification;
    } catch (error) {
        logger.error('Failed to create notification:', { error: error.message, userId });
        return null;
    }
};
