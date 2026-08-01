const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/cashPool.controller');
const { cashPoolParams } = require('../validators/treasuryRisk.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/', controller.list);
router.get(
  '/:cashPoolId/plan',
  validateRequest(cashPoolParams, 'params'),
  controller.plan
);

module.exports = router;
