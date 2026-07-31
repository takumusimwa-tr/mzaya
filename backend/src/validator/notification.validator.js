const Joi = require('joi');

const notificationIdParamsSchema = Joi.object({
  notificationId: Joi.string().uuid().required(),
});

const listNotificationsQuerySchema = Joi.object({
  unread: Joi.string().valid('true', 'false'),
  category: Joi.string().trim().max(40),
  limit: Joi.number().integer().min(1).max(100).default(20),
  cursor: Joi.date().iso(),
}).unknown(false);

module.exports = {
  notificationIdParamsSchema,
  listNotificationsQuerySchema,
};
