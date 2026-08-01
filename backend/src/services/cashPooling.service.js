const {
  TreasuryCashPool,
  TreasuryCashPoolMember,
  BankAccount,
} = require('../models/associations');

function calculateSweep({
  availableBalanceMinor,
  targetBalanceMinor,
  minimumSweepMinor,
  direction,
}) {
  const available = Number(availableBalanceMinor || 0);
  const target = Number(targetBalanceMinor || 0);
  const minimum = Number(minimumSweepMinor || 0);

  const difference = available - target;

  if (difference > 0 && ['both', 'to_header'].includes(direction)) {
    return difference >= minimum
      ? { direction: 'to_header', amountMinor: difference }
      : null;
  }

  if (difference < 0 && ['both', 'from_header'].includes(direction)) {
    const amount = Math.abs(difference);
    return amount >= minimum
      ? { direction: 'from_header', amountMinor: amount }
      : null;
  }

  return null;
}

async function buildCashPoolSweepPlan(cashPoolId) {
  const pool = await TreasuryCashPool.findByPk(cashPoolId, {
    include: [{
      model: TreasuryCashPoolMember,
      as: 'members',
      include: [{
        model: BankAccount,
        as: 'bankAccount',
        required: true,
      }],
    }],
  });

  if (!pool) {
    const error = new Error('Cash pool not found');
    error.status = 404;
    throw error;
  }

  return {
    pool,
    sweeps: pool.members
      .map((member) => ({
        member,
        sweep: calculateSweep({
          availableBalanceMinor: member.bankAccount.available_balance_minor,
          targetBalanceMinor: member.target_balance_minor,
          minimumSweepMinor: pool.minimum_sweep_minor,
          direction: member.sweep_direction,
        }),
      }))
      .filter((item) => item.sweep),
  };
}

module.exports = {
  calculateSweep,
  buildCashPoolSweepPlan,
};
