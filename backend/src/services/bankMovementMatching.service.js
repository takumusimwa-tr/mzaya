const { Op } = require('sequelize');
const {
  BankMovement,
  TreasuryTransfer,
} = require('../models/associations');

async function findTransferMatch(bankMovement) {
  if (bankMovement.treasury_transfer_id) {
    return TreasuryTransfer.findByPk(bankMovement.treasury_transfer_id);
  }

  const candidates = await TreasuryTransfer.findAll({
    where: {
      status: 'completed',
      currency: bankMovement.currency,
      amount_minor: bankMovement.amount_minor,
      completed_at: {
        [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    order: [['completed_at', 'DESC']],
    limit: 20,
  });

  if (bankMovement.bank_reference) {
    const exact = candidates.find(
      (item) =>
        item.provider_reference &&
        String(item.provider_reference) === String(bankMovement.bank_reference)
    );
    if (exact) return exact;
  }

  return candidates.length === 1 ? candidates[0] : null;
}

async function matchBankMovement(bankMovementId) {
  const movement = await BankMovement.findByPk(bankMovementId);

  if (!movement) {
    const error = new Error('Bank movement not found');
    error.status = 404;
    throw error;
  }

  const transfer = await findTransferMatch(movement);

  if (!transfer) return null;

  await movement.update({
    treasury_transfer_id: transfer.id,
    status: 'matched',
    matched_at: new Date(),
  });

  return transfer;
}

module.exports = {
  findTransferMatch,
  matchBankMovement,
};
