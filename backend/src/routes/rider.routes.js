const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const {
  getProfile, upsertProfile, toggleOnline, updateLocation, getRiderLocationForOrder,
} = require('../controllers/rider.controller');

router.get('/profile',            authenticate, requireRole(USER_ROLE.RIDER), getProfile);
router.put('/profile',            authenticate, requireRole(USER_ROLE.RIDER), upsertProfile);
router.patch('/online',           authenticate, requireRole(USER_ROLE.RIDER), toggleOnline);
router.patch('/location',         authenticate, requireRole(USER_ROLE.RIDER), updateLocation);
router.get('/location/:orderId',  authenticate, getRiderLocationForOrder);

module.exports = router;
