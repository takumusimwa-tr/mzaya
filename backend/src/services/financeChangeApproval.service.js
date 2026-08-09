const { sequelize } = require('../config/db');
const {
  FinanceChangeRequest, FinanceChangeApproval,
  FinanceMasterDataRecord, FinanceMasterDataVersion,
} = require('../models/associations');
const { hashPayload, activateVersion } = require('./financeMasterData.service');
const { financeMasterDataEvents, FINANCE_MASTER_DATA_EVENT } = require('../events/financeMasterData.events');

async function decideChangeRequest({ changeRequestId, approverId, decision, notes = null }) {
  const request = await FinanceChangeRequest.findByPk(changeRequestId);
  if (!request) {
    const error = new Error('Finance change request not found');
    error.status = 404;
    throw error;
  }
  if (String(request.requested_by) === String(approverId)) {
    const error = new Error('Requester cannot approve their own finance change');
    error.status = 403;
    error.code = 'MAKER_CHECKER_VIOLATION';
    throw error;
  }

  return sequelize.transaction(async (transaction) => {
    await FinanceChangeApproval.create({
      change_request_id: request.id,
      approver_id: approverId,
      decision,
      notes,
    }, { transaction });

    if (decision === 'reject') {
      await request.update({ status: 'rejected', rejected_at: new Date() }, { transaction });
      transaction.afterCommit(() => financeMasterDataEvents.emit(
        FINANCE_MASTER_DATA_EVENT.CHANGE_REJECTED, { changeRequestId: request.id }
      ));
      return request;
    }

    let record = request.record_id
      ? await FinanceMasterDataRecord.findByPk(request.record_id, { transaction, lock: transaction.LOCK.UPDATE })
      : null;

    if (!record) {
      record = await FinanceMasterDataRecord.create({
        domain_id: request.domain_id,
        record_key: request.requested_payload.recordKey,
        display_name: request.requested_payload.displayName || request.requested_payload.recordKey,
        created_by: request.requested_by,
        status: 'draft',
      }, { transaction });
      await request.update({ record_id: record.id }, { transaction });
    }

    const lastVersion = await FinanceMasterDataVersion.max('version_number', {
      where: { record_id: record.id }, transaction,
    });

    const version = await FinanceMasterDataVersion.create({
      record_id: record.id,
      version_number: Number(lastVersion || 0) + 1,
      payload: request.requested_payload,
      payload_hash: hashPayload(request.requested_payload),
      change_summary: request.reason,
      created_by: request.requested_by,
      approved_by: approverId,
      approved_at: new Date(),
      effective_from: request.requested_payload.effectiveFrom || null,
      effective_to: request.requested_payload.effectiveTo || null,
      status: 'approved',
    }, { transaction });

    await request.update({
      status: 'approved',
      approved_version_id: version.id,
    }, { transaction });

    transaction.afterCommit(async () => {
      await activateVersion({ versionId: version.id, approvedBy: approverId });
      await request.update({ status: 'implemented', implemented_at: new Date() });
      financeMasterDataEvents.emit(FINANCE_MASTER_DATA_EVENT.CHANGE_APPROVED, {
        changeRequestId: request.id, versionId: version.id,
      });
    });

    return request;
  });
}

module.exports = { decideChangeRequest };
