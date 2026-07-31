const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/refund.controller');
const schemas = require('../validators/refund.validator');

router.use(authenticate);

router.post(
  '/',
  validateRequest(schemas.requestRefundSchema),
  controller.request
);

router.patch(
  '/:refundId/approve',
  requireRole(USER_ROLE.ADMIN),
  validateRequest(schemas.refundIdParamsSchema, 'params'),
  validateRequest(schemas.approveRefundSchema),
  controller.approve
);

router.patch(
  '/:refundId/complete',
  requireRole(USER_ROLE.ADMIN),
  validateRequest(schemas.refundIdParamsSchema, 'params'),
  validateRequest(schemas.completeRefundSchema),
  controller.complete
);

module.exports = router;
