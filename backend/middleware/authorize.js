const Medicine = require('../models/Medicine');
const Reminder = require('../models/Reminder');
const FamilyMember = require('../models/FamilyMember');
const History = require('../models/History');
const asyncHandler = require('./asyncHandler');
const { ValidationError, NotFoundError, AppError } = require('../utils/errors');


exports.checkOwnership = asyncHandler(async (req, res, next) => {
    const modelName = req.params.model || req.baseUrl.split('/')[2]; // medicines, reminders, family, history
    const Model = {
        medicines: Medicine,
        reminders: Reminder,
        family: FamilyMember,
        history: History
    }[modelName];

    if (!Model) {
        throw new ValidationError('Invalid resource type specified');
    }

    const item = await Model.findById(req.params.id);
    if (!item) {
        throw new NotFoundError(modelName, `${modelName} not found`);
    }

    if (item.user.toString() !== req.user._id.toString()) {
        throw new AppError('Not authorized for this resource', 403, 'FORBIDDEN');
    }

    req.item = item;
    next();
});


exports.checkMedicineOwnership = asyncHandler(async (req, res, next) => {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
        throw new NotFoundError('Medicine', 'Medicine not found');
    }
    if (medicine.user.toString() !== req.user._id.toString()) {
        throw new AppError('Not authorized to access this medicine', 403, 'FORBIDDEN');
    }
    next();
});


exports.checkReminderOwnership = asyncHandler(async (req, res, next) => {
    const reminder = await Reminder.findById(req.params.id).populate('medicine');
    if (!reminder) {
        throw new NotFoundError('Reminder', 'Reminder not found');
    }
    if (reminder.user.toString() !== req.user._id.toString()) {
        throw new AppError('Not authorized to access this reminder', 403, 'FORBIDDEN');
    }
    next();
});
