const router = require('express').Router();
const {
  authenticate,
  requireRole,
} = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/ledger.controller');
const {
  transactionIdParamsSchema,
  reverseLedgerSchema,
} = require('../validators/ledger.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get(
  '/transactions/:transactionId',
  validateRequest(transactionIdParamsSchema, 'params'),
  controller.getTransaction
);

router.post(
  '/transactions/:transactionId/reverse',
  validateRequest(transactionIdParamsSchema, 'params'),
  validateRequest(reverseLedgerSchema),
  controller.reverse
);

module.exports = router;
