const FamilyMember = require('../models/FamilyMember');
const Medicine = require('../models/Medicine');

exports.addFamilyMember = async (req, res) => {
    try {
        const { name, relationship, age, medicalNotes } = req.body;

        const familyMember = await FamilyMember.create({
            name,
            relationship,
            age,
            medicalNotes,
            user: req.user._id,
        });

        res.status(201).json(familyMember);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFamilyMembers = async (req, res) => {
    try {
        const members = await FamilyMember.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFamilyMemberById = async (req, res) => {
    try {
        const member = await FamilyMember.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!member) {
            return res.status(404).json({ message: 'Family member not found' });
        }

        const medicines = await Medicine.find({ familyMember: req.params.id });

        res.json({ member, medicines });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateFamilyMember = async (req, res) => {
    try {
        const member = await FamilyMember.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );

        if (!member) {
            return res.status(404).json({ message: 'Family member not found' });
        }

        res.json(member);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteFamilyMember = async (req, res) => {
    try {
        const member = await FamilyMember.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!member) {
            return res.status(404).json({ message: 'Family member not found' });
        }

        await Medicine.deleteMany({ familyMember: req.params.id });

        res.json({ message: 'Family member and associated medicines deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

