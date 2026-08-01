const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const registrationController = require('../controllers/taxRegistration.controller');
const returnController = require('../controllers/taxReturn.controller');
const schemas = require('../validators/taxReporting.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/registrations', registrationController.list);

router.put(
  '/registrations',
  validateRequest(schemas.upsertRegistrationSchema),
  registrationController.upsert
);

router.get('/filing-periods', returnController.listPeriods);

router.get(
  '/returns',
  validateRequest(schemas.returnsQuerySchema, 'query'),
  returnController.listReturns
);

router.post(
  '/returns',
  validateRequest(schemas.prepareReturnSchema),
  returnController.prepare
);

router.patch(
  '/returns/:taxReturnId/approve',
  validateRequest(schemas.taxReturnParamsSchema, 'params'),
  returnController.approve
);

router.patch(
  '/returns/:taxReturnId/submit',
  validateRequest(schemas.taxReturnParamsSchema, 'params'),
  validateRequest(schemas.submitReturnSchema),
  returnController.submit
);

module.exports = router;
