const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller =
  require('../controllers/treasuryReconciliationReview.controller');
const schemas =
  require('../validators/bankStatementImport.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get(
  '/bank-transactions/:bankTransactionId/candidates',
  validateRequest(schemas.bankTransactionParamsSchema, 'params'),
  controller.candidates
);

router.post(
  '/candidates/:candidateId/accept',
  validateRequest(schemas.candidateParamsSchema, 'params'),
  validateRequest(schemas.candidateDecisionSchema),
  controller.accept
);

router.post(
  '/candidates/:candidateId/reject',
  validateRequest(schemas.candidateParamsSchema, 'params'),
  validateRequest(schemas.candidateDecisionSchema),
  controller.reject
);

module.exports = router;
