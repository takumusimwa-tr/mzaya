const {
  FinancialCloseCycle,
  FinancialCloseTask,
  TrialBalanceSnapshot,
  TrialBalanceLine,
} = require('../models/associations');
const {
  startCloseCycle,
  completeCloseTask,
  completeCloseCycle,
} = require('../services/financialClose.service');
const {
  generateTrialBalance,
} = require('../services/trialBalance.service');

async function start(req, res, next) {
  try {
    const cycle = await startCloseCycle({
      periodId: req.body.periodId,
      startedBy: req.user.id,
    });
    return res.status(201).json({ cycle });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const cycles = await FinancialCloseCycle.findAll({
      include: [{ model: FinancialCloseTask, as: 'tasks' }],
      order: [['started_at', 'DESC']],
    });
    return res.status(200).json({ cycles });
  } catch (error) {
    return next(error);
  }
}

async function completeTask(req, res, next) {
  try {
    const task = await completeCloseTask({
      taskId: req.params.taskId,
      completedBy: req.user.id,
      evidence: req.body.evidence,
      notes: req.body.notes,
    });
    return res.status(200).json({ task });
  } catch (error) {
    return next(error);
  }
}

async function generateBalance(req, res, next) {
  try {
    const snapshot = await generateTrialBalance({
      closeCycleId: req.params.closeCycleId,
      currency: req.body.currency,
      generatedBy: req.user.id,
      snapshotType: req.body.snapshotType,
    });
    return res.status(201).json({ snapshot });
  } catch (error) {
    return next(error);
  }
}

async function getBalance(req, res, next) {
  try {
    const snapshot = await TrialBalanceSnapshot.findByPk(
      req.params.snapshotId,
      {
        include: [{ model: TrialBalanceLine, as: 'lines' }],
      }
    );

    if (!snapshot) {
      return res.status(404).json({ error: 'Trial balance snapshot not found' });
    }

    return res.status(200).json({ snapshot });
  } catch (error) {
    return next(error);
  }
}

async function complete(req, res, next) {
  try {
    const cycle = await completeCloseCycle({
      closeCycleId: req.params.closeCycleId,
      completedBy: req.user.id,
    });
    return res.status(200).json({ cycle });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  start,
  list,
  completeTask,
  generateBalance,
  getBalance,
  complete,
};
