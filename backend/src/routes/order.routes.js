const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const {
  placeOrder,
  getOrder,
  myOrders,
  updateStatus,
  cancel,
} = require('../controllers/order.controller');

// All order routes require authentication
router.use(authenticate);

// POST /api/orders — customers only
router.post('/', requireRole(USER_ROLE.CUSTOMER), placeOrder);

// GET /api/orders/my — customers see their orders, riders see their deliveries
router.get('/my', myOrders);

// GET /api/orders/:id — customer, rider, or admin
router.get('/:id', getOrder);

// PATCH /api/orders/:id/status — riders only
router.patch('/:id/status', requireRole(USER_ROLE.RIDER), updateStatus);

// POST /api/orders/:id/cancel — customers only
router.post('/:id/cancel', requireRole(USER_ROLE.CUSTOMER), cancel);

module.exports = router;