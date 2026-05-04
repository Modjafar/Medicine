const FamilyMember = require('../models/FamilyMember');
const Medicine = require('../models/Medicine');
const asyncHandler = require('../middleware/asyncHandler');
const { NotFoundError } = require('../utils/errors');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * @desc    Add new family member
 * @route   POST /api/family
 * @access  Private
 */
exports.addFamilyMember = asyncHandler(async (req, res) => {
    const { name, relationship, age, medicalNotes } = req.body;

    const familyMember = await FamilyMember.create({
        name,
        relationship,
        age,
        medicalNotes,
        user: req.user._id,
    });

    logger.logRequest(req, 'Family member created', { familyMemberId: familyMember._id });

    res.status(201).json(responseHandler.created(familyMember, 'Family member added successfully'));
});

/**
 * @desc    Get all family members
 * @route   GET /api/family
 * @access  Private
 */
exports.getFamilyMembers = asyncHandler(async (req, res) => {
    const members = await FamilyMember.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(responseHandler.success(members, 'Family members retrieved successfully'));
});

/**
 * @desc    Get family member by ID with their medicines
 * @route   GET /api/family/:id
 * @access  Private
 */
exports.getFamilyMemberById = asyncHandler(async (req, res) => {
    const member = await FamilyMember.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!member) {
        throw new NotFoundError('Family member', 'Family member not found');
    }

    const medicines = await Medicine.find({ familyMember: req.params.id });

    res.json(responseHandler.success({ member, medicines }, 'Family member retrieved successfully'));
});

/**
 * @desc    Update family member
 * @route   PUT /api/family/:id
 * @access  Private
 */
exports.updateFamilyMember = asyncHandler(async (req, res) => {
    const member = await FamilyMember.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!member) {
        throw new NotFoundError('Family member', 'Family member not found');
    }

    logger.logRequest(req, 'Family member updated', { familyMemberId: member._id });

    res.json(responseHandler.success(member, 'Family member updated successfully'));
});

/**
 * @desc    Delete family member and associated medicines
 * @route   DELETE /api/family/:id
 * @access  Private
 */
exports.deleteFamilyMember = asyncHandler(async (req, res) => {
    const member = await FamilyMember.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!member) {
        throw new NotFoundError('Family member', 'Family member not found');
    }

    await Medicine.deleteMany({ familyMember: req.params.id });

    logger.logRequest(req, 'Family member deleted', { familyMemberId: req.params.id });

    res.json(responseHandler.deleted('Family member and associated medicines deleted successfully'));
});
