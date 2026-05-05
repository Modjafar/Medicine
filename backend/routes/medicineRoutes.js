const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole, checkMedicineAccess, adminOnly } = require('../middleware/authorize');
const {
    addMedicine,
    getMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine,
    markAsTaken,
    getLowStockMedicines,
    getDashboardStats,
} = require('../controllers/medicineController');

// All routes require authentication
router.use(protect);

// Get routes (both admin and family can access their own medicines)
router.get('/', getMedicines);
router.get('/stats', getDashboardStats);
router.get('/low-stock', getLowStockMedicines);
router.get('/:id', checkMedicineAccess, getMedicineById);

// Mark as taken (both can mark their own)
router.post('/:id/take', checkMedicineAccess, markAsTaken);

// Add medicine (admin only)
router.post('/', adminOnly, addMedicine);

// Update and delete (admin only)
router.put('/:id', adminOnly, checkMedicineAccess, updateMedicine);
router.delete('/:id', adminOnly, checkMedicineAccess, deleteMedicine);

module.exports = router;

