const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getHistory, getHistoryStats } = require('../controllers/historyController');

router.get('/', protect, getHistory);
router.get('/stats', protect, getHistoryStats);

module.exports = router;

