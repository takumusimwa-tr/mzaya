function numberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

module.exports = {
  thresholds: {
    outboxPendingWarn: numberEnv('FINANCE_SLO_OUTBOX_PENDING_WARN', 25),
    outboxPendingCritical: numberEnv('FINANCE_SLO_OUTBOX_PENDING_CRITICAL', 100),
    outboxOldestWarnSeconds: numberEnv('FINANCE_SLO_OUTBOX_OLDEST_WARN_SECONDS', 120),
    outboxOldestCriticalSeconds: numberEnv('FINANCE_SLO_OUTBOX_OLDEST_CRITICAL_SECONDS', 600),
    businessEventOldestWarnSeconds: numberEnv('FINANCE_SLO_BUSINESS_EVENT_OLDEST_WARN_SECONDS', 120),
    businessEventOldestCriticalSeconds: numberEnv('FINANCE_SLO_BUSINESS_EVENT_OLDEST_CRITICAL_SECONDS', 600),
    accountingEventOldestWarnSeconds: numberEnv('FINANCE_SLO_ACCOUNTING_EVENT_OLDEST_WARN_SECONDS', 120),
    accountingEventOldestCriticalSeconds: numberEnv('FINANCE_SLO_ACCOUNTING_EVENT_OLDEST_CRITICAL_SECONDS', 600),
    deliveryFailureRateWarnPct: numberEnv('FINANCE_SLO_DELIVERY_FAILURE_WARN_PCT', 2),
    deliveryFailureRateCriticalPct: numberEnv('FINANCE_SLO_DELIVERY_FAILURE_CRITICAL_PCT', 10),
    deadLetterCritical: numberEnv('FINANCE_SLO_DEAD_LETTER_CRITICAL', 1),
    postingFailureCritical: numberEnv('FINANCE_SLO_POSTING_FAILURE_CRITICAL', 1),
  },
};
