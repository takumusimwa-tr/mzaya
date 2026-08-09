const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/vendorSettlement.controller');
const schema = require('../validators/vendorSettlement.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get(
  '/',
  validateRequest(schema.listQuery, 'query'),
  controller.list
);

router.post(
  '/',
  validateRequest(schema.createBody),
  controller.create
);

router.post(
  '/:settlementId/approve',
  validateRequest(schema.settlementParams, 'params'),
  controller.approve
);

router.post(
  '/:settlementId/pay',
  validateRequest(schema.settlementParams, 'params'),
  validateRequest(schema.markPaidBody),
  controller.markPaid
);

router.get(
  '/reconciliation',
  validateRequest(schema.listQuery, 'query'),
  controller.reconciliationList
);

router.post(
  '/:settlementId/reconcile',
  validateRequest(schema.settlementParams, 'params'),
  controller.reconcile
);

module.exports = router;
