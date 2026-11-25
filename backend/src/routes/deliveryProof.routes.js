const router = require('express').Router();
const {
  authenticate,
  requireRole,
} = require('../middleware/auth.middleware');
const { loadOrder, activeRider } = require('../middleware/ownership.middleware');
const { validateRequest } = require('../middleware/validateRequest');
const { USER_ROLE } = require('../config/constants');
const {
  submit,
  read,
  timeline,
} = require('../controllers/deliveryProof.controller');
const {
  deliveryProofParamsSchema,
  deliveryProofBodySchema,
} = require('../validators/deliveryProof.validator');

router.post(
  '/orders/:orderId',
  authenticate,
  requireRole(USER_ROLE.RIDER),
  validateRequest(deliveryProofParamsSchema, 'params'),
  loadOrder({ allow: ['rider'], param: 'orderId' }),
  activeRider(),
  validateRequest(deliveryProofBodySchema),
  submit
);

router.get(
  '/orders/:orderId',
  authenticate,
  requireRole(...Object.values(USER_ROLE)),
  validateRequest(deliveryProofParamsSchema, 'params'),
  loadOrder({ allow: ['any'], param: 'orderId' }),
  read
);

router.get('/orders/:orderId/timeline', authenticate,
  requireRole(...Object.values(USER_ROLE)),
  validateRequest(deliveryProofParamsSchema, 'params'),
  loadOrder({ allow: ['any'], param: 'orderId' }), timeline);

module.exports = router;
