const Medicine = require('../models/Medicine');
const History = require('../models/History');
const Reminder = require('../models/Reminder');
const asyncHandler = require('../middleware/asyncHandler');
const { NotFoundError, ValidationError } = require('../utils/errors');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const { scheduleReminders } = require('../utils/reminderScheduler');

/**
 * @desc    Add new medicine
 * @route   POST /api/medicines
 * @access  Private
 */
exports.addMedicine = asyncHandler(async (req, res) => {
    const { name, quantity, dosagePerDay, reminderTimes, startDate, endDate, instructions, unit, familyMember } = req.body;

    // Check for duplicate medicine (case-insensitive)
    const existingMedicine = await Medicine.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        user: req.user._id,
    });

    if (existingMedicine) {
        throw new ValidationError(`Medicine "${name}" already exists for your account. Please use a different name or update the existing one.`);
    }

    // Validate reminderTimes based on dosagePerDay
    if (dosagePerDay === 1 && reminderTimes.length > 1) {
        throw new ValidationError('For 1 dose per day, only one reminder time is allowed.');
    }

    if (dosagePerDay > 1 && reminderTimes.length !== dosagePerDay) {
        throw new ValidationError(`For ${dosagePerDay} doses per day, you must provide ${dosagePerDay} reminder times.`);
    }

    const medicine = await Medicine.create({
        name,
        quantity,
        dosagePerDay,
        reminderTimes,
        startDate: startDate || Date.now(),
        endDate,
        instructions,
        unit: unit || 'tablets',
        user: req.user._id,
        familyMember: familyMember || null,
    });

    await scheduleReminders(medicine, req.user._id);

    logger.logRequest(req, 'Medicine created', { medicineId: medicine._id });

    res.status(201).json(responseHandler.created(medicine, 'Medicine added successfully'));
});

/**
 * @desc    Get all medicines for user
 * @route   GET /api/medicines
 * @access  Private
 */
exports.getMedicines = asyncHandler(async (req, res) => {
    const { familyMember } = req.query;

    // Role-based filtering
    let query = {};

    if (req.user.role === 'admin') {
        // Admin sees all medicines (owns them)
        query.user = req.user._id;
        if (familyMember) query.familyMember = familyMember;
    } else if (req.user.role === 'family') {
        // Family member sees only medicines assigned to them
        query.assignedTo = req.user._id;
    }

    const medicines = await Medicine.find(query).sort({ createdAt: -1 });
    res.json(responseHandler.success(medicines, 'Medicines retrieved successfully'));
});

/**
 * @desc    Get single medicine by ID
 * @route   GET /api/medicines/:id
 * @access  Private
 */
exports.getMedicineById = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!medicine) {
        throw new NotFoundError('Medicine', 'Medicine not found');
    }

    res.json(responseHandler.success(medicine, 'Medicine retrieved successfully'));
});

/**
 * @desc    Update medicine
 * @route   PUT /api/medicines/:id
 * @access  Private
 */
exports.updateMedicine = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!medicine) {
        throw new NotFoundError('Medicine', 'Medicine not found');
    }

    logger.logRequest(req, 'Medicine updated', { medicineId: medicine._id });

    res.json(responseHandler.success(medicine, 'Medicine updated successfully'));
});

/**
 * @desc    Delete medicine and associated reminders
 * @route   DELETE /api/medicines/:id
 * @access  Private
 */
exports.deleteMedicine = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!medicine) {
        throw new NotFoundError('Medicine', 'Medicine not found');
    }

    await Reminder.deleteMany({ medicine: req.params.id });

    logger.logRequest(req, 'Medicine deleted', { medicineId: req.params.id });

    res.json(responseHandler.deleted('Medicine and associated reminders deleted successfully'));
});

/**
 * @desc    Mark medicine as taken
 * @route   POST /api/medicines/:id/take
 * @access  Private
 */
exports.markAsTaken = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!medicine) {
        throw new NotFoundError('Medicine', 'Medicine not found');
    }

    if (medicine.quantity <= 0) {
        throw new ValidationError('Medicine is out of stock. Please refill your prescription.');
    }

    const quantityBefore = medicine.quantity;
    const dosageTaken = medicine.dosagePerDay;
    medicine.quantity = Math.max(0, medicine.quantity - dosageTaken);
    await medicine.save();

    await History.create({
        medicine: medicine._id,
        user: req.user._id,
        familyMember: medicine.familyMember,
        medicineName: medicine.name,
        quantityBefore,
        quantityAfter: medicine.quantity,
        dosageTaken,
        takenAt: new Date(),
    });

    await Reminder.findOneAndUpdate(
        { medicine: medicine._id, status: 'sent' },
        { status: 'taken' },
        { sort: { scheduledTime: -1 } }
    );

    logger.logRequest(req, 'Medicine marked as taken', { medicineId: medicine._id });

    res.json(responseHandler.success({
        medicine,
        lowStock: medicine.isLowStock,
        daysRemaining: medicine.daysRemaining,
    }, 'Medicine marked as taken'));
});

/**
 * @desc    Get low stock medicines
 * @route   GET /api/medicines/low-stock
 * @access  Private
 */
exports.getLowStockMedicines = asyncHandler(async (req, res) => {
    const medicines = await Medicine.find({
        user: req.user._id,
        quantity: { $gt: 0 },
        $expr: { $lte: [{ $floor: { $divide: ['$quantity', '$dosagePerDay'] } }, 3] },
    });

    res.json(responseHandler.success(medicines, 'Low stock medicines retrieved'));
});

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/medicines/dashboard
 * @access  Private
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
    const totalMedicines = await Medicine.countDocuments({ user: req.user._id });
    const activeMedicines = await Medicine.countDocuments({ user: req.user._id, isActive: true });
    const lowStock = await Medicine.find({
        user: req.user._id,
        quantity: { $gt: 0 },
        $expr: { $lte: [{ $floor: { $divide: ['$quantity', '$dosagePerDay'] } }, 3] },
    });
    const outOfStock = await Medicine.countDocuments({ user: req.user._id, quantity: 0 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysHistory = await History.countDocuments({
        user: req.user._id,
        takenAt: { $gte: today, $lt: tomorrow },
    });

    res.json(responseHandler.success({
        totalMedicines,
        activeMedicines,
        lowStockCount: lowStock.length,
        outOfStock,
        todaysDoses: todaysHistory,
        lowStockMedicines: lowStock,
    }, 'Dashboard statistics retrieved'));
});
