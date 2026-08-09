const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/procurementFinance.controller');
const schema = require('../validators/procurementFinance.validator');

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
  '/:procurementId/approve',
  validateRequest(schema.procurementParams, 'params'),
  controller.approve
);

router.post(
  '/:procurementId/complete',
  validateRequest(schema.procurementParams, 'params'),
  controller.complete
);

router.get(
  '/reconciliation',
  validateRequest(schema.listQuery, 'query'),
  controller.reconciliationList
);

router.post(
  '/:procurementId/reconcile',
  validateRequest(schema.procurementParams, 'params'),
  controller.reconcile
);

module.exports = router;
