// backend/src/routes/vendorStats.routes.js
const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { vendorStats } = require('../controllers/vendorStats.controller');

router.get('/', authenticate, requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN), vendorStats);

module.exports = router;
