// backend/src/middleware/rateLimit.middleware.js
//
// Rate limiting. Without it, the login endpoint is brute-forceable at network
// speed against a known Zimbabwean phone number.
//
// ── Why Redis ────────────────────────────────────────────────────────────────
// The counters used to live in each process's memory. That works on one box and
// quietly stops working the moment you scale:
//
//   • Two instances behind a load balancer → each keeps its own tally, so an
//     attacker gets double the budget (ten instances, ten times).
//   • Every deploy restarts the process → all counters reset, so anyone
//     mid-lockout is released by a routine deploy.
//
// A shared Redis store fixes both. If Redis is absent or unreachable we fall back
// to in-memory limits rather than failing requests — a degraded limiter beats an
// outage, and on a single instance the two are equivalent anyway.
//
// ── Keying note ──────────────────────────────────────────────────────────────
// Many Zimbabwean users share carrier-grade NAT, so one IP can represent a whole
// neighbourhood. Limits are deliberately loose enough not to punish a shared
// address, while still stopping a script — which runs orders of magnitude faster
// than any human.
const rateLimit = require('express-rate-limit');
const { logger } = require('../utils/logger');

const isProd = process.env.NODE_ENV === 'production';

// ─── Store ────────────────────────────────────────────────────────────────────
function buildRedisStore() {
  if (!process.env.REDIS_URL) {
    logger.warn('ratelimit_memory_store', {
      why: 'REDIS_URL not set — limits are per-instance and reset on deploy',
    });
    return undefined;   // express-rate-limit falls back to its memory store
  }

  try {
    // Optional deps: degrade rather than crash if they aren't installed.
    const { RedisStore } = require('rate-limit-redis');
    const { createClient } = require('redis');

    const client = createClient({ url: process.env.REDIS_URL });

    // Never throw. A Redis blip must not take the API down.
    client.on('error', (err) => {
      logger.error('ratelimit_redis_error', { error: err.message });
    });

    client.connect().catch((err) => {
      logger.error('ratelimit_redis_connect_failed', { error: err.message });
    });

    logger.info('ratelimit_redis_store', {
      url: String(process.env.REDIS_URL).replace(/:[^:@]*@/, ':***@'),
    });

    return new RedisStore({
      sendCommand: (...args) => client.sendCommand(args),
      prefix: 'mzaya:rl:',
    });
  } catch (err) {
    logger.warn('ratelimit_memory_store', {
      why: 'rate-limit-redis / redis not installed',
      error: err.message,
    });
    return undefined;
  }
}

const store = buildRedisStore();

// ─── Shared config ────────────────────────────────────────────────────────────
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
  // Off in development — it makes local testing miserable for no benefit.
  skip: () => !isProd,
};

// ─── Credentials: login, register ─────────────────────────────────────────────
// 10 attempts / 15 min. A human mistyping a password a few times is fine; a script
// trying thousands is not. Successful logins don't count — signing in on several
// devices shouldn't burn your own budget.
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

// ─── Writes: orders, offers, messages, uploads ────────────────────────────────
const writeLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  max: 30,
});

// ─── General reads ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  max: 300,
});

module.exports = { authLimiter, writeLimiter, apiLimiter };
