const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/taxFinance.controller');
const schema = require('../validators/taxFinance.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get(
  '/transactions',
  validateRequest(schema.listQuery, 'query'),
  controller.listTransactions
);

router.post(
  '/transactions',
  validateRequest(schema.createTaxTransaction),
  controller.createTransaction
);

router.post(
  '/transactions/:taxTransactionId/reverse',
  validateRequest(schema.taxTransactionParams, 'params'),
  validateRequest(schema.reverseBody),
  controller.reverseTransaction
);

router.get(
  '/liabilities',
  validateRequest(schema.listQuery, 'query'),
  controller.listLiabilities
);

router.post(
  '/liabilities/refresh',
  validateRequest(schema.refreshLiability),
  controller.refreshLiability
);

router.post(
  '/remittances',
  validateRequest(schema.createRemittance),
  controller.createRemittance
);

router.post(
  '/remittances/:remittanceId/paid',
  validateRequest(schema.remittanceParams, 'params'),
  validateRequest(schema.paidRemittance),
  controller.markRemittancePaid
);

router.get(
  '/reconciliation',
  validateRequest(schema.listQuery, 'query'),
  controller.listReconciliation
);

router.post(
  '/transactions/:taxTransactionId/reconcile',
  validateRequest(schema.taxTransactionParams, 'params'),
  controller.reconcile
);

module.exports = router;
