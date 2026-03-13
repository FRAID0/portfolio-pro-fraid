const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// POST /api/contact
router.post('/contact', contactController.submitContactForm);

// GET /api/test-email
router.get('/test-email', contactController.testEmail);

module.exports = router;
