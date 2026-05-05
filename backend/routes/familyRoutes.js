const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly, checkFamilyMemberAccess } = require('../middleware/authorize');
const {
    addFamilyMember,
    getFamilyMembers,
    getFamilyMemberById,
    updateFamilyMember,
    deleteFamilyMember,
} = require('../controllers/familyController');

// All routes require authentication
router.use(protect);

// Family management is admin-only
router.use(adminOnly);

router.post('/', addFamilyMember);
router.get('/', getFamilyMembers);
router.get('/:id', checkFamilyMemberAccess, getFamilyMemberById);
router.put('/:id', checkFamilyMemberAccess, updateFamilyMember);
router.delete('/:id', checkFamilyMemberAccess, deleteFamilyMember);

module.exports = router;

