const router = require('express').Router();
const {
  authenticate,
  requireRole,
} = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validateRequest');
const { USER_ROLE } = require('../config/constants');
const {
  submit,
  read,
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
  validateRequest(deliveryProofBodySchema),
  submit
);

router.get(
  '/orders/:orderId',
  authenticate,
  validateRequest(deliveryProofParamsSchema, 'params'),
  read
);

module.exports = router;
