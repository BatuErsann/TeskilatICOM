const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

// All routes here are protected by verifyAdmin
router.use(verifyAdmin);

router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/stats', adminController.getStats);

module.exports = router;
