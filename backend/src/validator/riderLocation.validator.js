const Joi = require('joi');

const riderLocationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  accuracy: Joi.number().min(0).max(10000).allow(null),
  heading: Joi.number().min(0).max(360).allow(null),
  speed: Joi.number().min(0).max(100).allow(null),
  recorded_at: Joi.date().iso().allow(null),
}).unknown(false);

module.exports = { riderLocationSchema };
