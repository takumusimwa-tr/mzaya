const crypto = require('crypto');
const {
  ConsolidationGroup,
  ConsolidationMember,
  ConsolidationRun,
  EliminationEntry,
  GroupReportSnapshot,
} = require('../models/associations');
const {
  generateIntercompanyEliminations,
} = require('./elimination.service');
const {
  aggregateGroupBalances,
} = require('./groupReporting.service');

async function startConsolidation({
  consolidationGroupId,
  periodCode,
  startedBy,
}) {
  const group = await ConsolidationGroup.findByPk(consolidationGroupId, {
    include: [{
      model: ConsolidationMember,
      as: 'members',
      required: true,
    }],
  });

  if (!group) {
    const error = new Error('Consolidation group not found');
    error.status = 404;
    throw error;
  }

  const run = await ConsolidationRun.create({
    consolidation_group_id: group.id,
    run_reference:
      `CON-${periodCode}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    period_code: periodCode,
    reporting_currency: group.reporting_currency,
    status: 'processing',
    started_by: startedBy,
    started_at: new Date(),
    metadata: {
      memberCount: group.members.length,
    },
  });

  try {
    await generateIntercompanyEliminations({
      consolidationRunId: run.id,
      reportingCurrency: group.reporting_currency,
    });

    const eliminations = await EliminationEntry.findAll({
      where: { consolidation_run_id: run.id },
      raw: true,
    });

    const reportData = aggregateGroupBalances({
      entityBalances: [],
      eliminationEntries: eliminations,
    });

    await GroupReportSnapshot.create({
      consolidation_run_id: run.id,
      report_type: 'group_summary',
      reporting_currency: group.reporting_currency,
      report_data: reportData,
      generated_by: startedBy,
    });

    await run.update({
      status: 'completed',
      completed_at: new Date(),
    });
  } catch (error) {
    await run.update({
      status: 'failed',
      failed_at: new Date(),
      error_message: String(error.message || error).slice(0, 1000),
    });
    throw error;
  }

  return run;
}

module.exports = { startConsolidation };
