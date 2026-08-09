const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller =
  require('../controllers/financeCrossDomainReconciliation.controller');
const {
  reconciliationQuery,
} = require('../validators/financeCutover.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get(
  '/dashboard',
  validateRequest(reconciliationQuery, 'query'),
  controller.dashboard
);

router.post('/runs', controller.run);

module.exports = router;
