const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const {
  initiateOrderPayment, pollOrderPayment, handleWebhook, mockPoll,
} = require('../controllers/payment.controller');

// Webhook — no auth (Paynow calls this directly on its resulturl).
router.post('/webhook', handleWebhook);

// Mock poll — only exercised in MOCK mode (no merchant account). No auth: the
// mock pollUrl is opaque and only reports a simulated status.
router.post('/mock-poll', mockPoll);
router.get('/mock-poll',  mockPoll);

// Authenticated customer routes.
router.post('/:id/pay',  authenticate, requireRole(USER_ROLE.CUSTOMER), initiateOrderPayment);
router.get('/:id/poll',  authenticate, requireRole(USER_ROLE.CUSTOMER), pollOrderPayment);

module.exports = router;
