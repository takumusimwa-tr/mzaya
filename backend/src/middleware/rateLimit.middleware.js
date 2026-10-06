const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { createClient } = require('redis');
const { logger } = require('../utils/logger');
const { isDeployed } = require('../config/runtimeEnv');

let redisClient = null;
let redisConnectPromise = null;

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

  // Start the connection before RedisStore instances are constructed. Some
  // store versions perform initialization commands immediately; without an
  // in-flight connect those commands reject with "The client is closed".
  // Keep the promise so boot readiness awaits this exact connection attempt.
  redisConnectPromise = redisClient.connect();
  redisConnectPromise.catch((err) => {
    logger.error('ratelimit_redis_connect_failed', { error: err.message });
  });

  logger.info('ratelimit_redis_client_configured');
  return redisClient;
}

buildRedisStore();

function limiterStore(prefix) {
  if (!redisClient) return undefined;

  // express-rate-limit requires a distinct Store instance for every limiter.
  // The Redis client may be shared; the store instance and key namespace may not.
  return new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: `mzaya:rl:${prefix}:`,
  });
}

async function verifyRateLimitStore() {
  if (!isDeployed) return;
  if (!redisClient) throw new Error('Rate-limit Redis client is not configured');
  if (redisConnectPromise) {
    await redisConnectPromise;
  } else if (!redisClient.isOpen) {
    redisConnectPromise = redisClient.connect();
    await redisConnectPromise;
  }
  await redisClient.ping();
  logger.info('ratelimit_redis_ready');
}

async function closeRateLimitStore() {
  if (redisClient?.isOpen) await redisClient.quit();
}

const base = {
  standardHeaders: true,
  legacyHeaders: false,
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
  store: limiterStore('auth'),
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

const writeLimiter = rateLimit({
  ...base,
  store: limiterStore('write'),
  windowMs: 60 * 1000,
  max: 30,
});
const apiLimiter = rateLimit({
  ...base,
  store: limiterStore('api'),
  windowMs: 60 * 1000,
  max: 300,
});

module.exports = {
  authLimiter,
  writeLimiter,
  apiLimiter,
  verifyRateLimitStore,
  closeRateLimitStore,
};
