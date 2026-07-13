// backend/src/middleware/rateLimit.middleware.js
//
// Rate limiting. Without this, the login endpoint is brute-forceable: an
// attacker can try passwords against a known Zimbabwean phone number as fast as
// the network allows. Everything else is open to scraping and abuse too.
//
// Three tiers, because a login attempt and a menu fetch deserve different
// budgets:
//
//   authLimiter    — very tight. Credential endpoints.
//   writeLimiter   — moderate. Anything that creates/mutates.
//   apiLimiter     — generous. Normal reads.
//
// Keyed by IP. Note the caveat: many Zimbabwean users share carrier-grade NAT,
// so an IP can represent many real people. The limits below are deliberately
// loose enough not to punish a shared IP, while still stopping a scripted
// attack (which runs orders of magnitude faster than humans).
const rateLimit = require('express-rate-limit');

const isProd = process.env.NODE_ENV === 'production';

// Shared config: return JSON (not HTML), use standard headers.
const base = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({
    error: 'Too many requests. Please slow down and try again shortly.',
  }),
  // Don't rate-limit in dev — it makes local testing miserable.
  skip: () => !isProd,
};

// ─── Credentials: login, register, password reset ─────────────────────────────
// 10 attempts per 15 min. A human mistyping a password a few times is fine; a
// script trying thousands is not.
const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 10,
  // Count only failures — a user logging in successfully several times
  // (multiple devices, re-auth) shouldn't burn their budget.
  skipSuccessfulRequests: true,
  handler: (req, res) => res.status(429).json({
    error: 'Too many login attempts. Please wait 15 minutes and try again.',
  }),
});

// ─── Writes: placing orders, offers, messages, uploads ────────────────────────
const writeLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  max: 30,
});

// ─── General API reads ────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  max: 300,
});

module.exports = { authLimiter, writeLimiter, apiLimiter };
