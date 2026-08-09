const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/mzayaPayout.controller');
const schema = require('../validators/mzayaPayout.validator');

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
  '/:payoutId/approve',
  validateRequest(schema.payoutParams, 'params'),
  controller.approve
);

router.post(
  '/:payoutId/pay',
  validateRequest(schema.payoutParams, 'params'),
  validateRequest(schema.markPaidBody),
  controller.markPaid
);

router.get(
  '/reconciliation',
  validateRequest(schema.listQuery, 'query'),
  controller.reconciliationList
);

router.post(
  '/:payoutId/reconcile',
  validateRequest(schema.payoutParams, 'params'),
  controller.reconcile
);

module.exports = router;
