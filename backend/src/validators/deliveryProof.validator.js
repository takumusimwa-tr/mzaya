const Joi = require('joi');

const deliveryProofParamsSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
});

const deliveryProofBodySchema = Joi.object({
  proof_type: Joi.string()
    .valid('photo', 'signature', 'recipient_confirmation')
    .required(),
  recipient_name: Joi.string().trim().max(120).allow('', null),
  recipient_phone: Joi.string().trim().max(40).allow('', null),
  otp_verified: Joi.boolean().valid(false).default(false),
  photo_url: Joi.string().max(4096).uri({ scheme: ['https'] }).allow('', null),
  signature_url: Joi.string().max(4096).uri({ scheme: ['https'] }).allow('', null),
  notes: Joi.string().trim().max(500).allow('', null),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
}).unknown(false);

module.exports = {
  deliveryProofParamsSchema,
  deliveryProofBodySchema,
};
