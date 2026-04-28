const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, refreshToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/refresh', refreshToken);

module.exports = router;
