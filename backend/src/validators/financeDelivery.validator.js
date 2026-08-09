const Joi = require('joi');

const listQuery = Joi.object({
  limit: Joi.number().integer().min(1).max(300).default(100),
}).unknown(false);

const deadLetterParams = Joi.object({
  deadLetterId: Joi.string().uuid().required(),
});

const reliabilitySnapshot = Joi.object({
  sourceSystem: Joi.string().max(80).allow('', null),
}).unknown(false);

module.exports = {
  listQuery,
  deadLetterParams,
  reliabilitySnapshot,
};
