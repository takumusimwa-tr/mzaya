const {
  SettlementProfile,
} = require('../models/associations');
const {
  nextSettlementDate,
} = require('./settlementSchedule.service');

function sanitizeDestination(destination = {}) {
  const allowed = [
    'destinationToken',
    'bankCode',
    'bankName',
    'accountLast4',
    'mobileNetwork',
    'mobileLast4',
    'beneficiaryName',
  ];

  return Object.fromEntries(
    Object.entries(destination).filter(([key]) => allowed.includes(key))
  );
}

async function upsertSettlementProfile({
  ownerType,
  ownerId,
  currency,
  payoutMethod,
  payoutDestination,
  minimumPayoutMinor = 0,
  schedule = 'weekly',
  holdDays = 0,
}) {
  const [profile] = await SettlementProfile.upsert({
    owner_type: ownerType,
    owner_id: ownerId,
    currency: String(currency).toUpperCase(),
    payout_method: payoutMethod,
    payout_destination: sanitizeDestination(payoutDestination),
    minimum_payout_minor: minimumPayoutMinor,
    schedule,
    hold_days: holdDays,
    status: 'active',
    next_settlement_at: nextSettlementDate({ schedule }),
  }, { returning: true });

  return profile;
}

module.exports = {
  sanitizeDestination,
  upsertSettlementProfile,
};
