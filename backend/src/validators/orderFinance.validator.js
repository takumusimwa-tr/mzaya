const Joi = require('joi');

module.exports = {
  listQuery: Joi.object({
    orderType: Joi.string()
      .valid('food', 'grocery', 'materials'),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(300)
      .default(100),
  }).unknown(false),

  reconcileParams: Joi.object({
    orderType: Joi.string()
      .valid('food', 'grocery', 'materials')
      .required(),
    orderId: Joi.string()
      .uuid()
      .required(),
  }),
};
