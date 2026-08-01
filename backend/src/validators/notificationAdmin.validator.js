const Joi = require('joi');

const listDeliveryQuerySchema = Joi.object({
  status: Joi.string().valid(
    'pending',
    'processing',
    'delivered',
    'failed',
    'skipped'
  ),
  channel: Joi.string().valid('in_app', 'push', 'email', 'sms'),
  limit: Joi.number().integer().min(1).max(100).default(30),
  cursor: Joi.date().iso(),
}).unknown(false);

const deliveryIdParamsSchema = Joi.object({
  deliveryId: Joi.string().uuid().required(),
});

module.exports = {
  listDeliveryQuerySchema,
  deliveryIdParamsSchema,
};
