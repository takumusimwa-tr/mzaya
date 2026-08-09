const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/treasuryFinance.controller');
const schema = require('../validators/treasuryFinance.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/transfers', validateRequest(schema.listQuery, 'query'), controller.listTransfers);
router.post('/transfers', validateRequest(schema.createTransfer), controller.createTransfer);
router.post(
  '/transfers/:transferId/approve',
  validateRequest(schema.transferParams, 'params'),
  controller.approveTransfer
);
router.post(
  '/transfers/:transferId/complete',
  validateRequest(schema.transferParams, 'params'),
  validateRequest(schema.completeTransfer),
  controller.completeTransfer
);
router.get('/bank-movements', validateRequest(schema.listQuery, 'query'), controller.listBankMovements);
router.get('/reconciliation', validateRequest(schema.listQuery, 'query'), controller.listReconciliation);
router.post(
  '/transfers/:transferId/reconcile',
  validateRequest(schema.transferParams, 'params'),
  controller.reconcile
);

module.exports = router;
