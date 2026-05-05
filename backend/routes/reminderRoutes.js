const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getUpcomingReminders,
    getTodayReminders,
    snoozeReminder,
    dismissReminder,
    getReminderHistory,
    markReminderAsTaken,
} = require('../controllers/reminderController');

router.get('/upcoming', protect, getUpcomingReminders);
router.get('/today', protect, getTodayReminders);
router.get('/history', protect, getReminderHistory);
router.post('/:id/taken', protect, markReminderAsTaken);
router.post('/:id/snooze', protect, snoozeReminder);
router.post('/:id/dismiss', protect, dismissReminder);

module.exports = router;

