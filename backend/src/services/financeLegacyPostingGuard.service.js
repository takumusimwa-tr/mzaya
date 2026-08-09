const crypto = require('crypto');
const {
  FinanceCutoverControl,
  FinanceLegacyPostingAttempt,
} = require('../models/associations');
const {
  CUTOVER_MODE,
} = require('../config/financeCutover.constants');

async function assertLegacyPostingAllowed({
  sourceModule,
  sourceAction = null,
  sourceRecordId = null,
  attemptedBy = null,
  payload = {},
}) {
  const control = await FinanceCutoverControl.findOne({
    where: {
      domain_key: sourceModule,
      status: 'active',
    },
    order: [['activated_at', 'DESC']],
  });

  const blocked =
    control &&
    [CUTOVER_MODE.EVENT_ENGINE, CUTOVER_MODE.BLOCK_LEGACY]
      .includes(control.current_mode);

  const attempt = await FinanceLegacyPostingAttempt.create({
    attempt_reference:
      `LPA-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    source_module: sourceModule,
    source_action: sourceAction,
    source_record_id: sourceRecordId,
    attempted_by: attemptedBy,
    cutover_control_id: control?.id || null,
    result: blocked ? 'blocked' : 'allowed',
    message: blocked
      ? 'Legacy direct-ledger posting is disabled for this finance domain.'
      : 'Legacy posting currently allowed.',
    payload,
  });

  if (blocked) {
    const error = new Error(
      'Legacy direct-ledger posting is disabled; publish a finance business event instead.'
    );
    error.status = 409;
    error.code = 'LEGACY_LEDGER_POSTING_DISABLED';
    error.attemptId = attempt.id;
    throw error;
  }

  return {
    allowed: true,
    attempt,
    control,
  };
}

module.exports = {
  assertLegacyPostingAllowed,
};
