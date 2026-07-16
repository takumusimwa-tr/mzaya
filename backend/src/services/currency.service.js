const { logger } = require('../utils/logger');

// ─── In-memory rate cache ─────────────────────────────────────────────────────
// Refreshed daily by the cron job in src/jobs/currencySync.job.js
let cachedRate = {
  usdToZig: null,
  fetchedAt: null,
};

// ─── Fetch latest USD → ZiG rate ─────────────────────────────────────────────
// RBZ does not have a public JSON API — we use a fallback approach:
// 1. Try a configured manual override (set in .env for now)
// 2. Fall back to last cached rate
// 3. Fall back to a safe hardcoded rate if nothing available
async function fetchZigRate() {
  try {
    // Manual override — update this in .env when RBZ announces rate changes
    // e.g. ZIG_RATE=27.50
    const manualRate = parseFloat(process.env.ZIG_RATE);
    if (manualRate && manualRate > 0) {
      cachedRate = { usdToZig: manualRate, fetchedAt: new Date() };
      return manualRate;
    }

    // Fallback — return last cached
    if (cachedRate.usdToZig) return cachedRate.usdToZig;

    // Last resort hardcoded fallback (update periodically)
    return 27.50;
  } catch (err) {
    logger.error('currency_fetch_error', { error: err.message });
    return cachedRate.usdToZig || 27.50;
  }
}

// ─── Get current rate (from cache) ───────────────────────────────────────────
function getCurrentRate() {
  return cachedRate.usdToZig || parseFloat(process.env.ZIG_RATE) || 27.50;
}

// ─── Convert USD to ZiG ───────────────────────────────────────────────────────
function usdToZig(amountUsd) {
  const rate = getCurrentRate();
  return parseFloat((amountUsd * rate).toFixed(2));
}

// ─── Convert ZiG to USD ───────────────────────────────────────────────────────
function zigToUsd(amountZig) {
  const rate = getCurrentRate();
  if (!rate) return null;
  return parseFloat((amountZig / rate).toFixed(2));
}

module.exports = { fetchZigRate, getCurrentRate, usdToZig, zigToUsd };