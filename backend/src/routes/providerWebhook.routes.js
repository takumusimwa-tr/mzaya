const express = require('express');
const router = express.Router();
const controller = require('../controllers/providerWebhook.controller');
const { validateRequest } = require('../middleware/validateRequest');
const {
  providerParamsSchema,
} = require('../validators/providerWebhook.validator');

/**
 * This route must be mounted before global JSON parsing when signature
 * verification depends on the exact raw request body.
 */
router.post(
  '/:provider',
  validateRequest(providerParamsSchema, 'params'),
  express.raw({
    type: '*/*',
    limit: '2mb',
  }),
  controller.receive
);

module.exports = router;
