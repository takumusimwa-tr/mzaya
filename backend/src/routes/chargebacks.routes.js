const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/chargeback.controller');
const schemas = require('../validators/chargeback.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.post(
  '/',
  validateRequest(schemas.registerChargebackSchema),
  controller.register
);

router.get('/', controller.list);

router.patch(
  '/:chargebackId',
  validateRequest(schemas.chargebackIdParamsSchema, 'params'),
  validateRequest(schemas.updateChargebackSchema),
  controller.update
);

module.exports = router;
