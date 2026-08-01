const Joi = require('joi');

const dispatchOrderParamsSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
});

const respondOfferParamsSchema = Joi.object({
  offerId: Joi.string().uuid().required(),
});

const respondOfferBodySchema = Joi.object({
  accept: Joi.boolean().required(),
  decline_reason: Joi.when('accept', {
    is: false,
    then: Joi.string().trim().max(255).allow('', null),
    otherwise: Joi.forbidden(),
  }),
}).unknown(false);

module.exports = {
  dispatchOrderParamsSchema,
  respondOfferParamsSchema,
  respondOfferBodySchema,
};
