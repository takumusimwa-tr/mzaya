const crypto = require('crypto');
const { FinanceMasterDataRecord, FinanceMasterDataVersion, FinanceChangeRequest } = require('../models/associations');
const { diffObjects } = require('./financeConfigurationDiff.service');
const { financeMasterDataEvents, FINANCE_MASTER_DATA_EVENT } = require('../events/financeMasterData.events');

async function createChangeRequest(input) {
  let previousPayload = null;
  if (input.recordId) {
    const record = await FinanceMasterDataRecord.findByPk(input.recordId, {
      include: [{ model: FinanceMasterDataVersion, as: 'currentVersion', required: false }],
    });
    if (!record) {
      const error = new Error('Master-data record not found');
      error.status = 404;
      throw error;
    }
    previousPayload = record.currentVersion?.payload || null;
  }

  const request = await FinanceChangeRequest.create({
    change_reference: `MDC-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    record_id: input.recordId || null,
    domain_id: input.domainId,
    change_type: input.changeType,
    requested_payload: input.requestedPayload,
    previous_payload: previousPayload,
    diff_payload: diffObjects(previousPayload || {}, input.requestedPayload || {}),
    impact_assessment: input.impactAssessment || {},
    reason: input.reason,
    requested_by: input.requestedBy,
    status: 'submitted',
  });

  financeMasterDataEvents.emit(FINANCE_MASTER_DATA_EVENT.CHANGE_SUBMITTED, {
    changeRequestId: request.id,
  });
  return request;
}

module.exports = { createChangeRequest };
