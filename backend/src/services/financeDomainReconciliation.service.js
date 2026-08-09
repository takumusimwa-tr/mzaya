const crypto = require('crypto');
const { Op } = require('sequelize');
const {
  FinanceDomainReconciliationSnapshot,
} = require('../models/associations');
const {
  getReconciliationAdapter,
  listReconciliationDomains,
} = require('./financeReconciliationRegistry.service');

async function buildDomainReconciliationSnapshot(domainKey) {
  const { model, evaluatedAt } = getReconciliationAdapter(domainKey);

  const latestBySource = await model.findAll({
    order: [[evaluatedAt, 'DESC']],
    limit: 1000,
  });

  const totalRecords = latestBySource.length;
  const matchedRecords = latestBySource.filter((item) => item.status === 'matched').length;
  const exceptionRecords = latestBySource.filter((item) => item.status === 'exception').length;
  const pendingRecords = latestBySource.filter((item) => item.status === 'pending').length;

  const staleCutoff = Date.now() - 24 * 60 * 60 * 1000;
  const staleRecords = latestBySource.filter((item) => {
    const at = new Date(item[evaluatedAt] || item.created_at).getTime();
    return item.status !== 'matched' && at < staleCutoff;
  }).length;

  const exceptionDates = latestBySource
    .filter((item) => item.status === 'exception')
    .map((item) => new Date(item[evaluatedAt] || item.created_at).getTime())
    .filter(Number.isFinite);

  const oldestExceptionAgeSeconds = exceptionDates.length
    ? Math.max(0, Math.floor((Date.now() - Math.min(...exceptionDates)) / 1000))
    : 0;

  const matchRate = totalRecords
    ? matchedRecords / totalRecords
    : 1;

  const healthStatus =
    exceptionRecords > 0 ||
    staleRecords > 0 ||
    matchRate < 0.995
      ? 'degraded'
      : 'healthy';

  return FinanceDomainReconciliationSnapshot.create({
    snapshot_reference:
      `DRS-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    domain_key: domainKey,
    total_records: totalRecords,
    matched_records: matchedRecords,
    exception_records: exceptionRecords,
    pending_records: pendingRecords,
    stale_records: staleRecords,
    match_rate: matchRate,
    oldest_exception_age_seconds: oldestExceptionAgeSeconds,
    health_status: healthStatus,
  });
}

async function buildAllDomainSnapshots() {
  const snapshots = [];
  for (const domainKey of listReconciliationDomains()) {
    snapshots.push(await buildDomainReconciliationSnapshot(domainKey));
  }
  return snapshots;
}

module.exports = {
  buildDomainReconciliationSnapshot,
  buildAllDomainSnapshots,
};
