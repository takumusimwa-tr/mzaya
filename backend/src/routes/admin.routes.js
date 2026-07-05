// backend/src/routes/admin.routes.js
const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const {
  overview, listVendors, approveVendor, rejectVendor,
  listRiders, approveRider, liveOrders,
} = require('../controllers/admin.controller');

// All admin routes require the admin role.
router.use(authenticate, requireRole(USER_ROLE.ADMIN));

router.get('/overview',            overview);
router.get('/vendors',             listVendors);
router.patch('/vendors/:id/approve', approveVendor);
router.patch('/vendors/:id/reject',  rejectVendor);
router.get('/riders',              listRiders);
router.patch('/riders/:id/approve',  approveRider);
router.get('/orders/live',         liveOrders);

module.exports = router;
