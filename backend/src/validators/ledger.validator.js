const Joi = require('joi');

const transactionIdParamsSchema = Joi.object({
  transactionId: Joi.string().uuid().required(),
});

const reverseLedgerSchema = Joi.object({
  reason: Joi.string().trim().max(500).required(),
}).unknown(false);

module.exports = {
  transactionIdParamsSchema,
  reverseLedgerSchema,
};
