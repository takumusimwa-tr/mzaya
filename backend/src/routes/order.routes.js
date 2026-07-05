const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const {
  placeOrder, quote, getOrder, myOrders, availableOrders, claimOrder,
  updateStatus, cancel, vendorOrders, rateOrder, upgradeVehicle,
} = require('../controllers/order.controller');

// Customer
router.post('/',           authenticate, requireRole(USER_ROLE.CUSTOMER), placeOrder);
router.post('/quote',      authenticate, requireRole(USER_ROLE.CUSTOMER), quote);
router.get('/my',          authenticate, myOrders);
router.post('/:id/cancel', authenticate, requireRole(USER_ROLE.CUSTOMER), cancel);
router.post('/:id/rate',   authenticate, requireRole(USER_ROLE.CUSTOMER), rateOrder);

// Rider — available orders + claiming (must come before /:id)
router.get('/available',   authenticate, requireRole(USER_ROLE.RIDER), availableOrders);
router.post('/:id/claim',  authenticate, requireRole(USER_ROLE.RIDER), claimOrder);

// Vendor
router.get('/vendor',      authenticate, requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN), vendorOrders);
router.post('/:id/upgrade-vehicle', authenticate, requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN), upgradeVehicle);

// Rider status updates
router.patch('/:id/status', authenticate, requireRole(USER_ROLE.RIDER, USER_ROLE.ADMIN), updateStatus);

// Any authenticated — must be last
router.get('/:id', authenticate, getOrder);

module.exports = router;
