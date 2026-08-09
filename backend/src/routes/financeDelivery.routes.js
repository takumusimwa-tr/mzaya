const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financeDelivery.controller');
const { listQuery } = require('../validators/financeDelivery.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get(
  '/dashboard',
  validateRequest(listQuery, 'query'),
  controller.dashboard
);

module.exports = router;
