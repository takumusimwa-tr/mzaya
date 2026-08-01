const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  BudgetLine,
  ForecastLine,
  LedgerEntry,
  LedgerTransaction,
  VarianceReport,
  VarianceReportLine,
} = require('../models/associations');

function calculateVariance({
  actualMinor,
  comparatorMinor,
  lineType,
}) {
  const actual = Number(actualMinor || 0);
  const comparator = Number(comparatorMinor || 0);
  const varianceMinor = actual - comparator;
  const varianceRatio = comparator === 0
    ? null
    : Number((varianceMinor / Math.abs(comparator)).toFixed(6));

  const favorable = String(lineType).includes('revenue')
    ? varianceMinor >= 0
    : varianceMinor <= 0;

  return {
    varianceMinor,
    varianceRatio,
    favorable,
  };
}

async function generateVarianceReport({
  reportType,
  currency,
  periodFrom,
  periodTo,
  budgetVersionId = null,
  forecastVersionId = null,
  generatedBy,
}) {
  return sequelize.transaction(async (transaction) => {
    const comparatorLines = budgetVersionId
      ? await BudgetLine.findAll({
          where: { budget_version_id: budgetVersionId },
          transaction,
          raw: true,
        })
      : await ForecastLine.findAll({
          where: { forecast_version_id: forecastVersionId },
          transaction,
          raw: true,
        });

    const report = await VarianceReport.create({
      report_reference: `VAR-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      report_type: reportType,
      currency,
      period_from: periodFrom,
      period_to: periodTo,
      budget_version_id: budgetVersionId,
      forecast_version_id: forecastVersionId,
      generated_by: generatedBy,
    }, { transaction });

    for (const line of comparatorLines) {
      const actualMinor = await LedgerEntry.sum('amount_minor', {
        include: [{
          model: LedgerTransaction,
          as: 'transaction',
          required: true,
          where: {
            currency,
            status: 'posted',
          },
        }],
        where: {
          account_id: line.account_id,
        },
        transaction,
      });

      const variance = calculateVariance({
        actualMinor,
        comparatorMinor: line.amount_minor,
        lineType: line.line_type,
      });

      await VarianceReportLine.create({
        variance_report_id: report.id,
        period_code: line.period_code,
        account_id: line.account_id,
        department_code: line.department_code,
        cost_center_code: line.cost_center_code,
        actual_minor: Number(actualMinor || 0),
        comparator_minor: Number(line.amount_minor || 0),
        variance_minor: variance.varianceMinor,
        variance_ratio: variance.varianceRatio,
        favorable: variance.favorable,
      }, { transaction });
    }

    return report;
  });
}

module.exports = {
  calculateVariance,
  generateVarianceReport,
};
