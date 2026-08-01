const crypto = require('crypto');
const { TreasuryFxDeal } = require('../models/associations');

async function createFxDeal({
  buyCurrency,
  sellCurrency,
  buyAmountMinor,
  sellAmountMinor,
  agreedRate,
  counterparty,
  tradeDate,
  settlementDate,
  createdBy,
}) {
  return TreasuryFxDeal.create({
    deal_reference: `FXD-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    buy_currency: buyCurrency,
    sell_currency: sellCurrency,
    buy_amount_minor: buyAmountMinor,
    sell_amount_minor: sellAmountMinor,
    agreed_rate: agreedRate,
    counterparty,
    trade_date: tradeDate,
    settlement_date: settlementDate,
    created_by: createdBy,
    status: 'booked',
  });
}

async function settleFxDeal({
  dealId,
  provider,
  providerReference,
}) {
  const deal = await TreasuryFxDeal.findByPk(dealId);

  if (!deal) {
    const error = new Error('FX deal not found');
    error.status = 404;
    throw error;
  }

  if (!['approved', 'booked'].includes(deal.status)) {
    const error = new Error('FX deal cannot be settled');
    error.status = 409;
    throw error;
  }

  await deal.update({
    status: 'settled',
    settlement_provider: provider,
    provider_reference: providerReference,
    settled_at: new Date(),
  });

  return deal;
}

module.exports = {
  createFxDeal,
  settleFxDeal,
};
