const Reminder = require('../models/Reminder');
const Medicine = require('../models/Medicine');

exports.getUpcomingReminders = async (req, res) => {
    try {
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

        res.json(reminders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTodayReminders = async (req, res) => {
    try {
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

        res.json(reminders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.snoozeReminder = async (req, res) => {
    try {
        const { minutes } = req.body;
        const reminder = await Reminder.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        const snoozeUntil = new Date(Date.now() + minutes * 60000);
        reminder.status = 'snoozed';
        reminder.snoozeUntil = snoozeUntil;
        reminder.snoozeCount += 1;
        await reminder.save();

        res.json(reminder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.dismissReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { status: 'missed' },
            { new: true }
        );

        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        res.json(reminder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getReminderHistory = async (req, res) => {
    try {
        const reminders = await Reminder.find({
            user: req.user._id,
            status: { $in: ['taken', 'missed'] },
        })
            .populate('medicine', 'name')
            .sort({ scheduledTime: -1 })
            .limit(50);

        res.json(reminders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

