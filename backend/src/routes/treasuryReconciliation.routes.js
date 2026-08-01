const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/treasuryReconciliation.controller');
const schema = require('../validators/treasury.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/queue', controller.queue);

router.post(
  '/:bankTransactionId/match',
  validateRequest(schema.reconciliationParams, 'params'),
  validateRequest(schema.reconciliationBody),
  controller.reconcile
);

module.exports = router;
