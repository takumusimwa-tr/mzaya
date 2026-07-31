const Joi = require('joi');

const vendorLiveOrdersParamsSchema = Joi.object({
  vendorId: Joi.string().uuid().required(),
});

module.exports = { vendorLiveOrdersParamsSchema };
