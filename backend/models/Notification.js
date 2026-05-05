const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['invite', 'reminder', 'medicine_assigned', 'low_stock'],
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: [100, 'Title too long']
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'relatedModel'
    },
    relatedModel: {
        type: String,
        enum: ['FamilyMember', 'Medicine', 'Reminder'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
