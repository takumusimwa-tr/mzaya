const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/paymentFinance.controller');
const schema = require('../validators/paymentFinance.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get(
  '/reconciliation',
  validateRequest(schema.listQuery, 'query'),
  controller.reconciliationList
);

router.post(
  '/:paymentId/reconcile',
  validateRequest(schema.paymentParams, 'params'),
  controller.reconcile
);

router.post(
  '/:paymentId/refunds',
  validateRequest(schema.paymentParams, 'params'),
  validateRequest(schema.refundBody),
  controller.refund
);

router.patch(
  '/refunds/:refundId/complete',
  validateRequest(schema.refundParams, 'params'),
  validateRequest(schema.completeRefundBody),
  controller.completeRefund
);

module.exports = router;
