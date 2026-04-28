const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addFamilyMemberValidation } = require('../middleware/validation');
const {
    addFamilyMember,
    getFamilyMembers,
    getFamilyMemberById,
    updateFamilyMember,
    deleteFamilyMember,
} = require('../controllers/familyController');

router.post('/', protect, addFamilyMemberValidation, addFamilyMember);
router.get('/', protect, getFamilyMembers);
router.get('/:id', protect, getFamilyMemberById);
router.put('/:id', protect, updateFamilyMember);
router.delete('/:id', protect, deleteFamilyMember);

module.exports = router;

