const Joi = require('joi');

const registerDeviceSchema = Joi.object({
  platform: Joi.string().valid('web', 'ios', 'android').required(),
  pushToken: Joi.string().trim().max(4096).required(),
  deviceId: Joi.string().trim().max(180).allow('', null),
  appVersion: Joi.string().trim().max(40).allow('', null),
  locale: Joi.string().trim().max(20).allow('', null),
  timezone: Joi.string().trim().max(60).allow('', null),
}).unknown(false);

const deactivateDeviceSchema = Joi.object({
  pushToken: Joi.string().trim().max(4096).required(),
}).unknown(false);

module.exports = {
  registerDeviceSchema,
  deactivateDeviceSchema,
};
