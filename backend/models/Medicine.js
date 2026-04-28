const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide medicine name'],
        trim: true,
        maxlength: [100, 'Medicine name cannot exceed 100 characters']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    familyMember: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember',
        default: null,
        index: true
    },
    quantity: {
        type: Number,
        required: [true, 'Please provide quantity'],
        min: [0, 'Quantity cannot be negative']
    },
    dosagePerDay: {
        type: Number,
        required: [true, 'Please provide dosage per day'],
        min: [1, 'Dosage must be at least 1']
    },
    reminderTimes: [{
        type: String,
        required: true
    }],
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    },
    instructions: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    unit: {
        type: String,
        default: 'tablets',
        enum: ['tablets', 'capsules', 'ml', 'drops', 'injections', 'patches']
    }
}, {
    timestamps: true
});

medicineSchema.virtual('daysRemaining').get(function () {
    if (this.quantity <= 0) return 0;
    return Math.floor(this.quantity / this.dosagePerDay);
});

medicineSchema.virtual('isLowStock').get(function () {
    return this.daysRemaining <= 3 && this.quantity > 0;
});

medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);

