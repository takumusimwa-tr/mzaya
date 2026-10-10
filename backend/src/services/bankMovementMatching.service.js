const { Op } = require('sequelize');
const {
  BankMovement,
  TreasuryTransfer,
} = require('../models/associations');

function transferCurrency(transfer) {
  return transfer.source_currency || transfer.currency || null;
}

function transferAmount(transfer) {
  return transfer.source_amount_minor ?? transfer.amount_minor ?? null;
}

async function findTransferMatch(bankMovement) {
  if (bankMovement.treasury_transfer_id) {
    return TreasuryTransfer.findByPk(bankMovement.treasury_transfer_id);
  }

  // Transitional contract: fetch recent completed transfers and compare through
  // canonical-first accessors rather than querying obsolete DB columns only.
  const recent = await TreasuryTransfer.findAll({
    where: {
      status: 'completed',
      completed_at: {
        [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    order: [['completed_at', 'DESC']],
    limit: 100,
  });

  const candidates = recent.filter((item) =>
    String(transferCurrency(item) || '').toUpperCase() ===
      String(bankMovement.currency || '').toUpperCase() &&
    Number(transferAmount(item)) === Number(bankMovement.amount_minor)
  );

  if (bankMovement.bank_reference) {
    const exact = candidates.find((item) => {
      const providerReference =
        item.provider_reference || item.metadata?.providerReference;
      return providerReference &&
        String(providerReference) === String(bankMovement.bank_reference);
    });
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
