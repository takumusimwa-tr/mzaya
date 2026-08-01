const Joi = require('joi');

const categorySchema = Joi.object({
  in_app: Joi.boolean(),
  push: Joi.boolean(),
  email: Joi.boolean(),
  sms: Joi.boolean(),
}).unknown(false);

const updatePreferencesSchema = Joi.object({
  preferences: Joi.object()
    .pattern(
      Joi.string().valid(
        'order',
        'dispatch',
        'payment',
        'account',
        'marketing'
      ),
      categorySchema
    )
    .min(1)
    .required(),
}).unknown(false);

module.exports = {
  updatePreferencesSchema,
};
