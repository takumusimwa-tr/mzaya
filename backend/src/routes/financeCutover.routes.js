const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financeCutover.controller');
const schema = require('../validators/financeCutover.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/dashboard', controller.dashboard);

router.get(
  '/controls/:controlId/readiness',
  validateRequest(schema.controlParams, 'params'),
  controller.readiness
);

router.post(
  '/controls/:controlId/request',
  validateRequest(schema.controlParams, 'params'),
  validateRequest(schema.reasonBody),
  controller.request
);

router.post(
  '/decisions/:decisionId/approve',
  validateRequest(schema.decisionParams, 'params'),
  controller.approve
);

router.post(
  '/controls/:controlId/rollback',
  validateRequest(schema.controlParams, 'params'),
  validateRequest(schema.reasonBody),
  controller.rollback
);

module.exports = router;
