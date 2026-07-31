const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/dispute.controller');
const schemas = require('../validators/dispute.validator');

router.use(authenticate);

router.post(
  '/',
  validateRequest(schemas.createDisputeSchema),
  controller.create
);

router.post(
  '/:disputeId/evidence',
  validateRequest(schemas.disputeIdParamsSchema, 'params'),
  validateRequest(schemas.evidenceSchema),
  controller.evidence
);

router.get(
  '/',
  requireRole(USER_ROLE.ADMIN),
  controller.list
);

router.patch(
  '/:disputeId',
  requireRole(USER_ROLE.ADMIN),
  validateRequest(schemas.disputeIdParamsSchema, 'params'),
  validateRequest(schemas.updateDisputeSchema),
  controller.update
);

module.exports = router;
