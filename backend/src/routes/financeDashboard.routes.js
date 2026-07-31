const router = require('express').Router();
const {
  authenticate,
  requireRole,
} = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financeDashboard.controller');
const {
  dashboardQuerySchema,
} = require('../validators/financeDashboard.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get(
  '/',
  validateRequest(dashboardQuerySchema, 'query'),
  controller.getDashboard
);

module.exports = router;
