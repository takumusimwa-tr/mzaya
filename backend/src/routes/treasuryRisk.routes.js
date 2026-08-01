const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const controller = require('../controllers/treasuryRisk.controller');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/dashboard', controller.dashboard);

module.exports = router;
