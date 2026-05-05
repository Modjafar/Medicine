const FamilyMember = require('../models/FamilyMember');
const Medicine = require('../models/Medicine');
const asyncHandler = require('../middleware/asyncHandler');
const { NotFoundError } = require('../utils/errors');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const { sendInviteEmail } = require('../utils/emailService');

/**
 * @desc    Add new family member
 * @route   POST /api/family
 * @access  Private
 */
exports.addFamilyMember = asyncHandler(async (req, res) => {
    const { name, relationship, age, medicalNotes, email } = req.body;

    // Validate email is provided
    if (!email) {
        const { ValidationError } = require('../utils/errors');
        throw new ValidationError('Email is required for family members');
    }

    // Check for duplicate family member (email must be unique per admin)
    const existingMember = await FamilyMember.findOne({
        email: { $regex: new RegExp(`^${email}$`, 'i') },
        user: req.user._id,
    });

    if (existingMember) {
        const { ValidationError } = require('../utils/errors');
        throw new ValidationError(`Family member with email "${email}" already exists in your account.`);
    }

    // Create the family member
    const familyMember = await FamilyMember.create({
        name,
        relationship,
        age,
        medicalNotes,
        email,
        user: req.user._id,
    });

    // Send invitation email
    let emailSent = false;
    try {
        logger.info('Attempting to send invitation email', {
            familyMemberEmail: email,
            familyMemberName: name,
            adminName: req.user.name
        });

        emailSent = await sendInviteEmail(
            email,
            name,
            req.user.name || 'Your Admin',
            req.user.email
        );

        if (emailSent) {
            logger.info('Invitation email sent successfully', {
                familyMemberId: familyMember._id,
                email
            });
        } else {
            logger.warn('Email service returned false - email may not be configured', {
                familyMemberId: familyMember._id,
                email
            });
        }
    } catch (emailError) {
        logger.error('Error sending invitation email (but family member was created)', {
            error: emailError.message,
            familyMemberId: familyMember._id,
            email,
        });
        // Don't throw - let the request succeed even if email fails
    }

    // Mark as invited regardless of email success (for tracking)
    familyMember.invited = true;
    await familyMember.save();

    logger.logRequest(req, 'Family member created', { familyMemberId: familyMember._id });

    // Return response with email status
    const responseMessage = emailSent
        ? 'Family member added successfully and invitation email sent!'
        : 'Family member added successfully. (Note: Email notification could not be sent - check email configuration)';

    res.status(201).json(responseHandler.created(
        { ...familyMember.toObject(), emailSent },
        responseMessage
    ));
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
