const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { initiateOrderPayment, handleWebhook, getPaymentStatus } = require('../controllers/payment.controller');

// Webhook — no auth (ContiPay calls this directly)
router.post('/webhook', handleWebhook);

// Authenticated routes
router.post('/:id/pay',    authenticate, requireRole(USER_ROLE.CUSTOMER), initiateOrderPayment);
router.get('/:id/status',  authenticate, requireRole(USER_ROLE.CUSTOMER), getPaymentStatus);

module.exports = router;