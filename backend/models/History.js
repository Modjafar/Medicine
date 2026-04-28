const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    familyMember: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember',
        default: null
    },
    medicineName: {
        type: String,
        required: true
    },
    quantityBefore: {
        type: Number,
        required: true
    },
    quantityAfter: {
        type: Number,
        required: true
    },
    dosageTaken: {
        type: Number,
        required: true,
        default: 1
    },
    takenAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('History', historySchema);

