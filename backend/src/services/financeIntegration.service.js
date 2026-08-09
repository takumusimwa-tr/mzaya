const {
  FinanceIntegrationLog,
  FinancePostingFailure,
} = require('../models/associations');

async function logIntegrationStage({
  businessEventId = null,
  stage,
  status,
  message = null,
  durationMs = null,
  context = {},
}) {
  return FinanceIntegrationLog.create({
    business_event_id: businessEventId,
    stage,
    status,
    message,
    duration_ms: durationMs,
    context,
  });
}

async function recordPostingFailure({
  businessEventId = null,
  accountingEventId = null,
  failureCode,
  failureStage,
  error,
  context = {},
}) {
  const existing = await FinancePostingFailure.findOne({
    where: {
      business_event_id: businessEventId,
      failure_code: failureCode,
      status: 'open',
    },
  });

  if (existing) {
    await existing.update({
      occurrence_count: Number(existing.occurrence_count || 0) + 1,
      last_occurred_at: new Date(),
      error_message: String(error.message || error).slice(0, 1500),
      error_context: context,
    });
    return existing;
  }

  return FinancePostingFailure.create({
    business_event_id: businessEventId,
    accounting_event_id: accountingEventId,
    failure_code: failureCode,
    failure_stage: failureStage,
    error_message: String(error.message || error).slice(0, 1500),
    error_context: context,
  });
}

module.exports = {
  logIntegrationStage,
  recordPostingFailure,
};
