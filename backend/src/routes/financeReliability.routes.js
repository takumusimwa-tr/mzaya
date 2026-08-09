const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financeReliability.controller');
const { reliabilitySnapshot } = require('../validators/financeDelivery.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/dashboard', controller.dashboard);
router.post(
  '/snapshots',
  validateRequest(reliabilitySnapshot),
  controller.snapshot
);

module.exports = router;
