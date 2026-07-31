const rateLimit = require('express-rate-limit');

const notificationReadRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 180,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many notification requests. Please try again shortly.',
  },
});

const notificationWriteRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many notification updates. Please try again shortly.',
  },
});

module.exports = {
  notificationReadRateLimit,
  notificationWriteRateLimit,
};
