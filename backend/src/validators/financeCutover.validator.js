const Joi = require('joi');

module.exports = {
  controlParams: Joi.object({
    controlId: Joi.string().uuid().required(),
  }),

  decisionParams: Joi.object({
    decisionId: Joi.string().uuid().required(),
  }),

  reasonBody: Joi.object({
    reason: Joi.string().max(1500).required(),
  }).unknown(false),

  reconciliationQuery: Joi.object({
    status: Joi.string().max(30),
  }).unknown(false),
};
