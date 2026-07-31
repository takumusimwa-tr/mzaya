const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/tax.controller');
const schemas = require('../validators/taxCompliance.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/jurisdictions', controller.listJurisdictions);

router.get(
  '/jurisdictions/:jurisdictionId/rates',
  validateRequest(schemas.jurisdictionParamsSchema, 'params'),
  controller.listRates
);

router.get(
  '/jurisdictions/:jurisdictionId/summary',
  validateRequest(schemas.jurisdictionParamsSchema, 'params'),
  validateRequest(schemas.taxSummaryQuerySchema, 'query'),
  controller.summary
);

module.exports = router;
