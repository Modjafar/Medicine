const History = require('../models/History');
const Medicine = require('../models/Medicine');

exports.getHistory = async (req, res) => {
    try {
        const { medicine, startDate, endDate, familyMember } = req.query;
        const query = { user: req.user._id };

        if (medicine) query.medicine = medicine;
        if (familyMember) query.familyMember = familyMember;
        if (startDate || endDate) {
            query.takenAt = {};
            if (startDate) query.takenAt.$gte = new Date(startDate);
            if (endDate) query.takenAt.$lte = new Date(endDate);
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const [history, total] = await Promise.all([
            History.find(query)
                .populate('medicine', 'name unit')
                .populate('familyMember', 'name relationship')
                .sort({ takenAt: -1 })
                .skip(skip)
                .limit(limit),
            History.countDocuments(query),
        ]);

        res.json({
            history,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getHistoryStats = async (req, res) => {
    try {
        const { medicine } = req.query;
        const query = { user: req.user._id };
        if (medicine) query.medicine = medicine;

        const totalTaken = await History.countDocuments(query);
        const last7Days = await History.countDocuments({
            ...query,
            takenAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        });
        const last30Days = await History.countDocuments({
            ...query,
            takenAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        });

        const adherenceData = await History.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$takenAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            totalTaken,
            last7Days,
            last30Days,
            adherenceData,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

