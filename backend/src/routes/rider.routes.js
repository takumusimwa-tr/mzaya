const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { registerRider, getRiderProfile, toggleOnline, updateLocation } = require('../controllers/rider.controller');

router.use(authenticate);

router.post('/',              requireRole(USER_ROLE.RIDER), registerRider);
router.get('/profile',        requireRole(USER_ROLE.RIDER), getRiderProfile);
router.patch('/online',       requireRole(USER_ROLE.RIDER), toggleOnline);
router.patch('/location',     requireRole(USER_ROLE.RIDER), updateLocation);

module.exports = router;