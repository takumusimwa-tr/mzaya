const { Op } = require('sequelize');
const {
  LedgerEntry,
  LedgerTransaction,
  SettlementItem,
} = require('../models/associations');

async function listEligibleLedgerEntries({
  accountId,
  holdDays,
  settlementDate,
  transaction,
}) {
  const cutoff = new Date(settlementDate);
  cutoff.setUTCDate(cutoff.getUTCDate() - Number(holdDays || 0));
  cutoff.setUTCHours(23, 59, 59, 999);

  const alreadySettledRows = await SettlementItem.findAll({
    attributes: ['source_entry_id'],
    raw: true,
    transaction,
  });

  const excludedIds = alreadySettledRows.map((row) => row.source_entry_id);

  const where = {
    account_id: accountId,
    direction: 'credit',
    created_at: { [Op.lte]: cutoff },
  };

  if (excludedIds.length) {
    where.id = { [Op.notIn]: excludedIds };
  }

  return LedgerEntry.findAll({
    where,
    include: [{
      model: LedgerTransaction,
      as: 'transaction',
      required: true,
      where: {
        status: 'posted',
      },
    }],
    order: [['created_at', 'ASC']],
    transaction,
  });
}

function sumEntries(entries) {
  return entries.reduce(
    (total, entry) => total + Number(entry.amount_minor),
    0
  );
}

module.exports = {
  listEligibleLedgerEntries,
  sumEntries,
};
