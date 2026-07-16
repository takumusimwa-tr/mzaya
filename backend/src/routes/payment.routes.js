const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { loadOrder } = require('../middleware/ownership.middleware');
const { USER_ROLE } = require('../config/constants');
const {
  initiateOrderPayment, pollOrderPayment, handleWebhook, mockPoll,
} = require('../controllers/payment.controller');

// Webhook — no auth. Paynow calls this directly on its resulturl, and it carries
// no session. It is protected instead by a hash signature (verified in
// parseWebhook) and by event deduplication, so a forged or replayed call can't
// mark an order paid.
router.post('/webhook', handleWebhook);

// Mock poll — only reachable when MOCK is on (development). The handler 404s
// otherwise, so this cannot be probed in production.
router.post('/mock-poll', mockPoll);
router.get('/mock-poll',  mockPoll);

// Paying for an order. loadOrder() proves the caller owns it BEFORE the handler
// runs — you cannot start a payment against someone else's order by guessing a
// UUID.
router.post('/:id/pay',
  authenticate, requireRole(USER_ROLE.CUSTOMER),
  loadOrder({ allow: ['customer'] }),
  initiateOrderPayment);

router.get('/:id/poll',
  authenticate, requireRole(USER_ROLE.CUSTOMER),
  loadOrder({ allow: ['customer'] }),
  pollOrderPayment);

module.exports = router;
