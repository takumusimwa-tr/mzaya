const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { createClient } = require('redis');
const { logger } = require('../utils/logger');
const { isDeployed } = require('../config/runtimeEnv');

let redisClient = null;

function buildRedisStore() {
  if (!process.env.REDIS_URL) {
    if (isDeployed) {
      throw new Error('REDIS_URL is required for deployed rate limiting');
    }
    logger.warn('ratelimit_memory_store', {
      why: 'REDIS_URL not set — local limits are per-process',
    });
    return undefined;
  }

  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => {
    logger.error('ratelimit_redis_error', { error: err.message });
  });

  // Connection happens eagerly, but request handling does not await Redis. The
  // store itself fails requests safely according to express-rate-limit behavior;
  // startup readiness is verified explicitly from index.js before listening.
  redisClient.connect().catch((err) => {
    logger.error('ratelimit_redis_connect_failed', { error: err.message });
  });

  logger.info('ratelimit_redis_store_configured');
  return new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'mzaya:rl:',
  });
}

const store = buildRedisStore();

async function verifyRateLimitStore() {
  if (!isDeployed) return;
  if (!redisClient) throw new Error('Rate-limit Redis client is not configured');
  if (!redisClient.isOpen) await redisClient.connect();
  await redisClient.ping();
  logger.info('ratelimit_redis_ready');
}

async function closeRateLimitStore() {
  if (redisClient?.isOpen) await redisClient.quit();
}

const base = {
  standardHeaders: true,
  legacyHeaders: false,
  store,
  handler: (req, res) => {
    logger.warn('ratelimit_hit', { reqId: req.id, path: req.originalUrl, ip: req.ip });
    res.status(429).json({
      error: 'Too many requests. Please slow down and try again shortly.',
    });
  },
  // Only local development and tests skip limits. Staging is deliberately live.
  skip: () => !isDeployed,
};

const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn('ratelimit_auth_hit', { reqId: req.id, path: req.originalUrl, ip: req.ip });
    res.status(429).json({
      error: 'Too many login attempts. Please wait 15 minutes and try again.',
    });
  },
});

const writeLimiter = rateLimit({ ...base, windowMs: 60 * 1000, max: 30 });
const apiLimiter = rateLimit({ ...base, windowMs: 60 * 1000, max: 300 });

module.exports = {
  authLimiter,
  writeLimiter,
  apiLimiter,
  verifyRateLimitStore,
  closeRateLimitStore,
};
