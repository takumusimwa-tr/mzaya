const { FinancePeriodLock } = require('../models/associations');

async function isPeriodLocked({ periodKey, scopeType, scopeValue = null, currency = null }) {
  return FinancePeriodLock.findOne({
    where: {
      period_key: periodKey,
      scope_type: scopeType,
      scope_value: scopeValue,
      currency,
      status: 'active',
    },
  });
}

async function assertPeriodOpen(input) {
  const lock = await isPeriodLocked(input);
  if (lock?.lock_type === 'hard') {
    const error = new Error('Finance period is locked');
    error.status = 409;
    error.code = 'FINANCE_PERIOD_LOCKED';
    throw error;
  }
  return lock;
}

async function createPeriodLock(input) {
  const [lock] = await FinancePeriodLock.upsert({
    period_key: input.periodKey,
    scope_type: input.scopeType,
    scope_value: input.scopeValue || null,
    currency: input.currency || null,
    lock_type: input.lockType,
    reason: input.reason,
    locked_by: input.lockedBy,
    locked_at: new Date(),
    status: 'active',
  }, { returning: true });
  return lock;
}

async function unlockPeriod({ periodLockId, unlockedBy }) {
  const lock = await FinancePeriodLock.findByPk(periodLockId);
  if (!lock) {
    const error = new Error('Finance period lock not found');
    error.status = 404;
    throw error;
  }
  if (String(lock.locked_by) === String(unlockedBy)) {
    const error = new Error('Period locker cannot independently unlock the same period');
    error.status = 403;
    error.code = 'MAKER_CHECKER_VIOLATION';
    throw error;
  }
  await lock.update({
    status: 'released',
    unlocked_by: unlockedBy,
    unlocked_at: new Date(),
  });
  return lock;
}

module.exports = { isPeriodLocked, assertPeriodOpen, createPeriodLock, unlockPeriod };
