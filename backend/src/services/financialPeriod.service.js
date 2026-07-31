const { Op } = require('sequelize');
const { FinancialPeriod } = require('../models/associations');
const { recordComplianceAudit } = require('./complianceAudit.service');

async function getPeriodForDate(date) {
  const value = new Date(date).toISOString().slice(0, 10);

  return FinancialPeriod.findOne({
    where: {
      start_date: { [Op.lte]: value },
      end_date: { [Op.gte]: value },
    },
  });
}

async function assertOpenFinancialPeriod(date) {
  const period = await getPeriodForDate(date);

  if (!period) {
    const error = new Error('No financial period covers this date');
    error.status = 409;
    error.code = 'FINANCIAL_PERIOD_NOT_FOUND';
    throw error;
  }

  if (period.status !== 'open') {
    const error = new Error('Financial period is closed');
    error.status = 409;
    error.code = 'FINANCIAL_PERIOD_CLOSED';
    throw error;
  }

  return period;
}

async function closeFinancialPeriod({
  periodId,
  actorId,
  notes,
}) {
  const period = await FinancialPeriod.findByPk(periodId);
  if (!period) {
    const error = new Error('Financial period not found');
    error.status = 404;
    throw error;
  }

  const previous = { status: period.status };

  await period.update({
    status: 'closed',
    closed_by: actorId,
    closed_at: new Date(),
    notes: notes || period.notes,
  });

  await recordComplianceAudit({
    actorId,
    action: 'financial_period_closed',
    resourceType: 'financial_period',
    resourceId: period.id,
    previousValue: previous,
    newValue: { status: 'closed' },
  });

  return period;
}

async function reopenFinancialPeriod({
  periodId,
  actorId,
  notes,
}) {
  const period = await FinancialPeriod.findByPk(periodId);
  if (!period) {
    const error = new Error('Financial period not found');
    error.status = 404;
    throw error;
  }

  await period.update({
    status: 'open',
    reopened_by: actorId,
    reopened_at: new Date(),
    notes: notes || period.notes,
  });

  await recordComplianceAudit({
    actorId,
    action: 'financial_period_reopened',
    resourceType: 'financial_period',
    resourceId: period.id,
    previousValue: { status: 'closed' },
    newValue: { status: 'open' },
  });

  return period;
}

module.exports = {
  getPeriodForDate,
  assertOpenFinancialPeriod,
  closeFinancialPeriod,
  reopenFinancialPeriod,
};
