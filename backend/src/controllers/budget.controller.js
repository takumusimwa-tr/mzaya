const {
  Budget,
  BudgetVersion,
  BudgetLine,
} = require('../models/associations');
const {
  createBudget,
  approveBudgetVersion,
} = require('../services/budget.service');

async function list(req, res, next) {
  try {
    const budgets = await Budget.findAll({
      include: [{
        model: BudgetVersion,
        as: 'versions',
        include: [{ model: BudgetLine, as: 'lines' }],
      }],
      order: [['fiscal_year', 'DESC'], ['name', 'ASC']],
    });

    return res.status(200).json({ budgets });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const result = await createBudget({
      ...req.body,
      ownerId: req.user.id,
    });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function approve(req, res, next) {
  try {
    const version = await approveBudgetVersion({
      budgetVersionId: req.params.budgetVersionId,
      approverId: req.user.id,
    });
    return res.status(200).json({ version });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  create,
  approve,
};
