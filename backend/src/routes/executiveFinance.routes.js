const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/executiveFinance.controller');
const { dashboardQuery } = require('../validators/executiveFinance.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get(
  '/dashboard',
  validateRequest(dashboardQuery, 'query'),
  controller.dashboard
);

module.exports = router;
