const mongoose = require('mongoose');

const scheduledJobSchema = new mongoose.Schema({
    reminderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reminder',
        required: true
    },
    scheduledTime: {
        type: Date,
        required: true
    },
    jobKey: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'executed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ScheduledJob', scheduledJobSchema);

