const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    scheduledTime: {
        type: Date,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'taken', 'missed', 'snoozed'],
        default: 'pending'
    },
    snoozeCount: {
        type: Number,
        default: 0
    },
    snoozeUntil: {
        type: Date,
        default: null
    },
    sentAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Reminder', reminderSchema);

