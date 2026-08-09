const {
  FinancePostingRule,
  FinancePostingTemplate,
  FinanceAccountingEvent,
  FinanceJournalBatch,
  FinancePostingFailure,
} = require('../models/associations');
const {
  createJournalBatch,
} = require('../services/financeJournalBatch.service');

async function dashboard(req, res, next) {
  try {
    const [rules, templates, accountingEvents, batches, failures] =
      await Promise.all([
        FinancePostingRule.findAll({
          where: { status: 'active' },
          order: [['priority', 'ASC']],
        }),
        FinancePostingTemplate.findAll({
          where: { status: 'active' },
          order: [['template_key', 'ASC'], ['version_number', 'DESC']],
        }),
        FinanceAccountingEvent.findAll({
          order: [['prepared_at', 'DESC']],
          limit: 100,
        }),
        FinanceJournalBatch.findAll({
          order: [['created_at', 'DESC']],
          limit: 100,
        }),
        FinancePostingFailure.findAll({
          where: { status: 'open' },
          order: [['last_occurred_at', 'DESC']],
          limit: 100,
        }),
      ]);

    return res.status(200).json({
      rules,
      templates,
      accountingEvents,
      batches,
      failures,
    });
  } catch (error) {
    return next(error);
  }
}

async function createBatch(req, res, next) {
  try {
    const batch = await createJournalBatch({
      ...req.body,
      createdBy: req.user.id,
    });
    return res.status(201).json({ batch });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  dashboard,
  createBatch,
};
