const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  FinanceReportingPack,
  FinanceReportingSection,
  FinanceNarrative,
} = require('../models/associations');
const {
  buildExecutiveFinanceSummary,
} = require('./executiveFinanceAnalytics.service');
const {
  generateExecutiveNarrative,
} = require('./financeNarrative.service');
const {
  executiveFinanceEvents,
  EXECUTIVE_FINANCE_EVENT,
} = require('../events/executiveFinance.events');

async function generateReportingPack({
  packType,
  title,
  periodFrom,
  periodTo,
  currency,
  generatedBy,
}) {
  return sequelize.transaction(async (transaction) => {
    const summary = await buildExecutiveFinanceSummary({
      currency,
      from: periodFrom,
      to: periodTo,
    });

    const pack = await FinanceReportingPack.create({
      pack_reference:
        `FRP-${packType.toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      pack_type: packType,
      title,
      period_from: periodFrom,
      period_to: periodTo,
      currency,
      generated_by: generatedBy,
      status: 'ready',
    }, { transaction });

    const sections = [
      {
        section_key: 'executive_summary',
        title: 'Executive summary',
        section_type: 'narrative',
        sequence: 10,
        content: { totals: summary.totals },
      },
      {
        section_key: 'liquidity',
        title: 'Liquidity & treasury',
        section_type: 'metrics',
        sequence: 20,
        content: {
          liquidity: summary.liquidity,
          alerts: summary.treasuryAlerts,
        },
      },
      {
        section_key: 'profitability',
        title: 'Profitability',
        section_type: 'leaderboard',
        sequence: 30,
        content: { snapshots: summary.profitability },
      },
      {
        section_key: 'planning',
        title: 'Budget & forecast',
        section_type: 'variance',
        sequence: 40,
        content: { varianceReports: summary.varianceReports },
      },
      {
        section_key: 'close_readiness',
        title: 'Close readiness',
        section_type: 'status',
        sequence: 50,
        content: { closeCycle: summary.closeCycle },
      },
    ];

    const createdSections = await FinanceReportingSection.bulkCreate(
      sections.map((section) => ({
        reporting_pack_id: pack.id,
        ...section,
      })),
      { transaction, returning: true }
    );

    const summarySection = createdSections.find(
      (section) => section.section_key === 'executive_summary'
    );

    await FinanceNarrative.create({
      reporting_pack_id: pack.id,
      section_id: summarySection?.id || null,
      narrative_type: 'executive_summary',
      title: 'Finance commentary',
      body: generateExecutiveNarrative(summary),
      generated_from: [
        'order_economics',
        'liquidity_snapshots',
        'treasury_alerts',
        'variance_reports',
        'financial_close_cycles',
      ],
      authored_by: generatedBy,
      status: 'draft',
    }, { transaction });

    transaction.afterCommit(() => {
      executiveFinanceEvents.emit(
        EXECUTIVE_FINANCE_EVENT.REPORTING_PACK_READY,
        { reportingPackId: pack.id }
      );
    });

    return pack;
  });
}

module.exports = {
  generateReportingPack,
};
