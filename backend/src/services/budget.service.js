const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  Budget,
  BudgetVersion,
  BudgetLine,
} = require('../models/associations');

function validateBalancedBudget(lines) {
  if (!Array.isArray(lines) || !lines.length) {
    const error = new Error('Budget requires at least one line');
    error.status = 422;
    throw error;
  }

  return lines.reduce(
    (sum, line) => sum + Number(line.amountMinor || 0),
    0
  );
}

async function createBudget({
  name,
  budgetType,
  currency,
  fiscalYear,
  ownerId,
  assumptions = {},
  lines,
}) {
  const totalMinor = validateBalancedBudget(lines);

  return sequelize.transaction(async (transaction) => {
    const budget = await Budget.create({
      budget_code: `BUD-${fiscalYear}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      name,
      budget_type: budgetType,
      currency: String(currency).toUpperCase(),
      fiscal_year: fiscalYear,
      owner_id: ownerId,
      metadata: { totalMinor },
    }, { transaction });

    const version = await BudgetVersion.create({
      budget_id: budget.id,
      version_number: 1,
      assumptions,
      created_by: ownerId,
      status: 'draft',
    }, { transaction });

    await BudgetLine.bulkCreate(
      lines.map((line) => ({
        budget_version_id: version.id,
        period_code: line.periodCode,
        account_id: line.accountId || null,
        department_code: line.departmentCode || null,
        cost_center_code: line.costCenterCode || null,
        line_type: line.lineType,
        amount_minor: line.amountMinor,
        notes: line.notes || null,
      })),
      { transaction }
    );

    return { budget, version };
  });
}

async function approveBudgetVersion({
  budgetVersionId,
  approverId,
}) {
  const version = await BudgetVersion.findByPk(budgetVersionId, {
    include: [{ model: Budget, as: 'budget', required: true }],
  });

  if (!version) {
    const error = new Error('Budget version not found');
    error.status = 404;
    throw error;
  }

  if (String(version.created_by) === String(approverId)) {
    const error = new Error('Creator cannot approve the same budget version');
    error.status = 403;
    error.code = 'MAKER_CHECKER_VIOLATION';
    throw error;
  }

  await version.update({
    status: 'approved',
    approved_by: approverId,
    approved_at: new Date(),
  });

  await version.budget.update({
    status: 'approved',
    approved_by: approverId,
    approved_at: new Date(),
  });

  return version;
}

module.exports = {
  validateBalancedBudget,
  createBudget,
  approveBudgetVersion,
};
