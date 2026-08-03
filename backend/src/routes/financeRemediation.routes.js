const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financeRemediation.controller');
const schema = require('../validators/financeAudit.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/', controller.list);
router.post(
  '/',
  validateRequest(schema.createRemediation),
  controller.create
);
router.patch(
  '/:remediationId/complete',
  validateRequest(schema.remediationParams, 'params'),
  validateRequest(schema.completeRemediation),
  controller.complete
);
router.patch(
  '/:remediationId/verify',
  validateRequest(schema.remediationParams, 'params'),
  validateRequest(schema.verifyRemediation),
  controller.verify
);

module.exports = router;
