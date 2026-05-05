const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
} = require('../controllers/notificationController');

// All routes are private
router.use(protect);

router.get('/', getNotifications);
router.get('/count/unread', getUnreadCount);
router.put('/:id', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
