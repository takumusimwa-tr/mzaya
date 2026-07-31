const router = require('express').Router();
const {
  authenticate,
  requireRole,
} = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/providerWebhookAdmin.controller');
const schemas = require('../validators/providerWebhook.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get(
  '/events',
  validateRequest(schemas.eventQuerySchema, 'query'),
  controller.listEvents
);

router.post(
  '/events/:eventId/retry',
  validateRequest(schemas.eventIdParamsSchema, 'params'),
  controller.retryEvent
);

router.get(
  '/reconciliation-runs',
  validateRequest(schemas.reconciliationRunsQuerySchema, 'query'),
  controller.listReconciliationRuns
);

module.exports = router;
