const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financeAudit.controller');
const schema = require('../validators/financeAudit.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/dashboard', controller.dashboard);
router.post('/plans', validateRequest(schema.createPlan), controller.createPlan);
router.post(
  '/engagements',
  validateRequest(schema.createEngagement),
  controller.createEngagement
);
router.post(
  '/assessments',
  validateRequest(schema.createAssessment),
  controller.createAssessment
);
router.post(
  '/evidence',
  validateRequest(schema.createEvidence),
  controller.createEvidence
);

module.exports = router;
