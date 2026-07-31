const router = require('express').Router();
const {
  authenticate,
  requireRole,
} = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/reconciliation.controller');
const {
  ingestReconciliationSchema,
  reconciliationQuerySchema,
} = require('../validators/reconciliation.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.post(
  '/',
  validateRequest(ingestReconciliationSchema),
  controller.ingest
);

router.get(
  '/exceptions',
  validateRequest(reconciliationQuerySchema, 'query'),
  controller.exceptions
);

module.exports = router;
