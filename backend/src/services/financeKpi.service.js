const { Op } = require('sequelize');
const {
  FinanceKpiDefinition,
  FinanceKpiSnapshot,
  ExecutiveFinanceAlert,
} = require('../models/associations');
const {
  executiveFinanceEvents,
  EXECUTIVE_FINANCE_EVENT,
} = require('../events/executiveFinance.events');

function evaluateKpiStatus(definition, value) {
  const numeric = Number(value);
  const warning = definition.warning_threshold == null
    ? null : Number(definition.warning_threshold);
  const critical = definition.critical_threshold == null
    ? null : Number(definition.critical_threshold);
  const direction = definition.favorable_direction;

  if (direction === 'higher') {
    if (critical != null && numeric <= critical) return 'critical';
    if (warning != null && numeric <= warning) return 'warning';
  } else {
    if (critical != null && numeric >= critical) return 'critical';
    if (warning != null && numeric >= warning) return 'warning';
  }

  return 'normal';
}

async function saveKpiSnapshot({
  kpiKey,
  snapshotDate,
  periodType,
  periodKey,
  currency = null,
  dimensionType = null,
  dimensionValue = null,
  value,
  sourceLineage = [],
  metadata = {},
}) {
  const definition = await FinanceKpiDefinition.findOne({
    where: { kpi_key: kpiKey, status: 'active' },
  });

  if (!definition) {
    const error = new Error(`KPI definition not found: ${kpiKey}`);
    error.status = 404;
    throw error;
  }

  const status = evaluateKpiStatus(definition, value);

  const [snapshot] = await FinanceKpiSnapshot.upsert({
    kpi_definition_id: definition.id,
    snapshot_date: snapshotDate,
    period_type: periodType,
    period_key: periodKey,
    currency,
    dimension_type: dimensionType,
    dimension_value: dimensionValue,
    value,
    status,
    source_lineage: sourceLineage,
    calculated_at: new Date(),
    metadata,
  }, { returning: true });

  if (status !== 'normal') {
    const [alert] = await ExecutiveFinanceAlert.findOrCreate({
      where: {
        kpi_snapshot_id: snapshot.id,
        status: 'open',
      },
      defaults: {
        alert_type: 'kpi_threshold_breach',
        severity: status,
        title: `${definition.name} is ${status}`,
        description: `Current value ${value} breached the configured ${status} threshold.`,
        metadata: {
          kpiKey,
          value,
        },
      },
    });

    executiveFinanceEvents.emit(
      EXECUTIVE_FINANCE_EVENT.KPI_ALERT_RAISED,
      { alertId: alert.id, kpiSnapshotId: snapshot.id }
    );
  }

  executiveFinanceEvents.emit(
    EXECUTIVE_FINANCE_EVENT.KPI_SNAPSHOT_READY,
    { kpiSnapshotId: snapshot.id }
  );

  return snapshot;
}

async function getKpiTrend({
  kpiKey,
  from,
  to,
  currency = null,
}) {
  const definition = await FinanceKpiDefinition.findOne({
    where: { kpi_key: kpiKey },
  });

  if (!definition) return [];

  const where = {
    kpi_definition_id: definition.id,
    snapshot_date: { [Op.between]: [from, to] },
  };

  if (currency) where.currency = currency;

  return FinanceKpiSnapshot.findAll({
    where,
    order: [['snapshot_date', 'ASC']],
  });
}

module.exports = {
  evaluateKpiStatus,
  saveKpiSnapshot,
  getKpiTrend,
};
