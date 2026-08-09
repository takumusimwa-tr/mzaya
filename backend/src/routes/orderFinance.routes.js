const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/orderFinance.controller');
const schema = require('../validators/orderFinance.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get(
  '/reconciliation',
  validateRequest(schema.listQuery, 'query'),
  controller.list
);

router.post(
  '/:orderType/:orderId/reconcile',
  validateRequest(schema.reconcileParams, 'params'),
  controller.reconcile
);

module.exports = router;
