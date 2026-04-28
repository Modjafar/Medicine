const Medicine = require('../models/Medicine');
const History = require('../models/History');
const Reminder = require('../models/Reminder');
const { scheduleReminders } = require('../utils/reminderScheduler');

exports.addMedicine = async (req, res) => {
    try {
        const { name, quantity, dosagePerDay, reminderTimes, startDate, endDate, instructions, unit, familyMember } = req.body;

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

        res.status(201).json(medicine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMedicines = async (req, res) => {
    try {
        const { familyMember } = req.query;
        const query = { user: req.user._id };
        if (familyMember) query.familyMember = familyMember;

        const medicines = await Medicine.find(query).sort({ createdAt: -1 });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMedicineById = async (req, res) => {
    try {
        const medicine = await Medicine.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        res.json(medicine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        res.json(medicine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        await Reminder.deleteMany({ medicine: req.params.id });

        res.json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAsTaken = async (req, res) => {
    try {
        const medicine = await Medicine.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        if (medicine.quantity <= 0) {
            return res.status(400).json({ message: 'Medicine is out of stock' });
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

        res.json({
            medicine,
            message: 'Medicine marked as taken',
            lowStock: medicine.isLowStock,
            daysRemaining: medicine.daysRemaining,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLowStockMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find({
            user: req.user._id,
            quantity: { $gt: 0 },
            $expr: { $lte: [{ $floor: { $divide: ['$quantity', '$dosagePerDay'] } }, 3] },
        });

        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
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

        res.json({
            totalMedicines,
            activeMedicines,
            lowStockCount: lowStock.length,
            outOfStock,
            todaysDoses: todaysHistory,
            lowStockMedicines: lowStock,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

