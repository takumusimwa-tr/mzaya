const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/intercompany.controller');
const schema = require('../validators/consolidation.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/', validateRequest(schema.listQuery, 'query'), controller.list);
router.post('/', validateRequest(schema.createIntercompany), controller.create);

router.patch(
  '/:transactionId/reconcile',
  validateRequest(schema.transactionParams, 'params'),
  validateRequest(schema.reconcileIntercompany),
  controller.reconcile
);

module.exports = router;
