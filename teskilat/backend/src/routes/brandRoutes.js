const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

// Public Routes
router.get('/', brandController.getAllBrands);

// Admin Routes
router.post('/', verifyAdmin, brandController.addBrand);
router.put('/:id', verifyAdmin, brandController.updateBrand);
router.delete('/:id', verifyAdmin, brandController.deleteBrand);

module.exports = router;
