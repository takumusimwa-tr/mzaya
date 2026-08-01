const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole: authorizeRoles } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  healthSummary,
  listDeliveries,
  retry,
} = require('../controllers/notificationAdmin.controller');
const {
  listDeliveryQuerySchema,
  deliveryIdParamsSchema,
} = require('../validators/notificationAdmin.validator');

router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/health', healthSummary);

router.get(
  '/deliveries',
  validateRequest(listDeliveryQuerySchema, 'query'),
  listDeliveries
);

router.post(
  '/deliveries/:deliveryId/retry',
  validateRequest(deliveryIdParamsSchema, 'params'),
  retry
);

module.exports = router;
