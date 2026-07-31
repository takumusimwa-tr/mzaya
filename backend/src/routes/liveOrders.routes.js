const router = require('express').Router();
const {
  authenticate,
  requireRole,
} = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validateRequest');
const { USER_ROLE } = require('../config/constants');
const {
  customerActiveOrder,
  vendorLiveOrders,
  riderCurrentOrder,
  riderAvailableOrders,
} = require('../controllers/liveOrders.controller');
const {
  vendorLiveOrdersParamsSchema,
} = require('../validators/liveOrders.validator');

router.get(
  '/customer/active',
  authenticate,
  requireRole(USER_ROLE.CUSTOMER),
  customerActiveOrder
);

router.get(
  '/vendor/:vendorId',
  authenticate,
  requireRole(USER_ROLE.VENDOR),
  validateRequest(vendorLiveOrdersParamsSchema, 'params'),
  vendorLiveOrders
);

router.get(
  '/rider/current',
  authenticate,
  requireRole(USER_ROLE.RIDER),
  riderCurrentOrder
);

router.get(
  '/rider/available',
  authenticate,
  requireRole(USER_ROLE.RIDER),
  riderAvailableOrders
);

module.exports = router;
