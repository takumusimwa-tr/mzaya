const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const periodController = require('../controllers/financialPeriod.controller');
const complianceController = require('../controllers/compliance.controller');
const schemas = require('../validators/taxCompliance.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/periods', periodController.list);

router.patch(
  '/periods/:periodId/close',
  validateRequest(schemas.periodParamsSchema, 'params'),
  validateRequest(schemas.periodActionSchema),
  periodController.close
);

router.patch(
  '/periods/:periodId/reopen',
  validateRequest(schemas.periodParamsSchema, 'params'),
  validateRequest(schemas.periodActionSchema),
  periodController.reopen
);

router.get('/audit', complianceController.listAudit);

module.exports = router;
