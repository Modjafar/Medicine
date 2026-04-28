const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addMedicineValidation } = require('../middleware/validation');
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

router.post('/', protect, addMedicineValidation, addMedicine);
router.get('/', protect, getMedicines);
router.get('/stats', protect, getDashboardStats);
router.get('/low-stock', protect, getLowStockMedicines);
router.get('/:id', protect, getMedicineById);
router.put('/:id', protect, updateMedicine);
router.delete('/:id', protect, deleteMedicine);
router.post('/:id/take', protect, markAsTaken);

module.exports = router;

