const crypto = require('crypto');
const { sequelize } = require('../config/db');
const { FinanceMasterDataRecord, FinanceMasterDataVersion } = require('../models/associations');

function hashPayload(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

async function createMasterDataRecord(input) {
  return sequelize.transaction(async (transaction) => {
    const record = await FinanceMasterDataRecord.create({
      domain_id: input.domainId,
      record_key: input.recordKey,
      display_name: input.displayName,
      effective_from: input.effectiveFrom || null,
      effective_to: input.effectiveTo || null,
      source_type: input.sourceType || null,
      source_id: input.sourceId || null,
      created_by: input.createdBy,
      status: 'draft',
    }, { transaction });

    const version = await FinanceMasterDataVersion.create({
      record_id: record.id,
      version_number: 1,
      payload: input.payload,
      payload_hash: hashPayload(input.payload),
      effective_from: input.effectiveFrom || null,
      effective_to: input.effectiveTo || null,
      created_by: input.createdBy,
      status: 'draft',
    }, { transaction });

    await record.update({ current_version_id: version.id }, { transaction });
    return { record, version };
  });
}

async function activateVersion({ versionId, approvedBy }) {
  return sequelize.transaction(async (transaction) => {
    const version = await FinanceMasterDataVersion.findByPk(versionId, {
      transaction, lock: transaction.LOCK.UPDATE,
    });
    if (!version) {
      const error = new Error('Master-data version not found');
      error.status = 404;
      throw error;
    }

    const record = await FinanceMasterDataRecord.findByPk(version.record_id, {
      transaction, lock: transaction.LOCK.UPDATE,
    });

    await FinanceMasterDataVersion.update(
      { status: 'superseded', superseded_at: new Date() },
      { where: { record_id: record.id, status: 'active' }, transaction }
    );

    await version.update({
      status: 'active',
      approved_by: approvedBy,
      approved_at: version.approved_at || new Date(),
      activated_at: new Date(),
    }, { transaction });

    await record.update({
      status: 'active',
      current_version_id: version.id,
      effective_from: version.effective_from,
      effective_to: version.effective_to,
    }, { transaction });

    return { record, version };
  });
}

module.exports = { hashPayload, createMasterDataRecord, activateVersion };
