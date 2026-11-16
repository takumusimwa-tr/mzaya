const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { trends } = require('../controllers/adTrends.controller');
router.get('/', authenticate, requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN), trends);
module.exports = router;
