const express = require('express');
const contactController = require('../controllers/contactController');
const { contactLimiter } = require('../middlewares/rateLimiters');

const router = express.Router();

router.post('/', contactLimiter, contactController.sendContactEmail);

module.exports = router;
