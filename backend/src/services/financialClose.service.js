const crypto = require('crypto');
const {
  FinancialCloseCycle,
  FinancialCloseTask,
  TrialBalanceSnapshot,
} = require('../models/associations');

const DEFAULT_TASKS = [
  ['bank_reconciliation', 'Complete bank reconciliations', 'reconciliation', 10],
  ['provider_reconciliation', 'Complete provider reconciliations', 'reconciliation', 20],
  ['settlement_review', 'Review pending settlements', 'settlements', 30],
  ['tax_review', 'Review tax obligations', 'tax', 40],
  ['trial_balance', 'Generate and review trial balance', 'reporting', 50],
  ['statement_review', 'Generate financial statements', 'reporting', 60],
  ['management_signoff', 'Management close sign-off', 'governance', 70],
];

async function startCloseCycle({
  periodId,
  startedBy,
}) {
  const [cycle, created] = await FinancialCloseCycle.findOrCreate({
    where: { period_id: periodId },
    defaults: {
      close_reference: `CLOSE-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      started_by: startedBy,
      status: 'open',
    },
  });

  if (created) {
    await FinancialCloseTask.bulkCreate(
      DEFAULT_TASKS.map(([taskKey, name, category, sequence]) => ({
        close_cycle_id: cycle.id,
        task_key: taskKey,
        name,
        category,
        sequence,
      }))
    );
  }

  return cycle;
}

async function completeCloseTask({
  taskId,
  completedBy,
  evidence = {},
  notes = null,
}) {
  const task = await FinancialCloseTask.findByPk(taskId);

  if (!task) {
    const error = new Error('Financial close task not found');
    error.status = 404;
    throw error;
  }

  await task.update({
    status: 'completed',
    completed_by: completedBy,
    completed_at: new Date(),
    evidence,
    notes,
  });

  return task;
}

async function completeCloseCycle({
  closeCycleId,
  completedBy,
}) {
  const cycle = await FinancialCloseCycle.findByPk(closeCycleId, {
    include: [{
      model: FinancialCloseTask,
      as: 'tasks',
      required: true,
    }],
  });

  if (!cycle) {
    const error = new Error('Financial close cycle not found');
    error.status = 404;
    throw error;
  }

  const incomplete = cycle.tasks.filter((task) => task.status !== 'completed');
  if (incomplete.length) {
    const error = new Error('All close tasks must be completed');
    error.status = 409;
    error.code = 'CLOSE_TASKS_INCOMPLETE';
    throw error;
  }

  const trialBalance = await TrialBalanceSnapshot.findOne({
    where: {
      close_cycle_id: cycle.id,
      snapshot_type: 'final',
      balanced: true,
    },
    order: [['generated_at', 'DESC']],
  });

  if (!trialBalance) {
    const error = new Error('Balanced final trial balance is required');
    error.status = 409;
    error.code = 'FINAL_TRIAL_BALANCE_REQUIRED';
    throw error;
  }

  await cycle.update({
    status: 'completed',
    completed_by: completedBy,
    completed_at: new Date(),
  });

  return cycle;
}

module.exports = {
  DEFAULT_TASKS,
  startCloseCycle,
  completeCloseTask,
  completeCloseCycle,
};
