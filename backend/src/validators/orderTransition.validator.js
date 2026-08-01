const Joi = require('joi');
const { ORDER_STATUS } = require('../constants/orderStatus');

const transitionOrderSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ORDER_STATUS)).required(),
  note: Joi.string().trim().max(500).allow('', null),
  delivery_proof_url: Joi.string().uri().max(2048).allow(null),
  metadata: Joi.object().unknown(true).default({}),
}).unknown(false);

module.exports = { transitionOrderSchema };
