const FINANCE_DOMAIN = Object.freeze({
  PAYMENTS: 'payments',
  ORDERS: 'orders',
  VENDOR_SETTLEMENTS: 'vendor_settlements',
  MZAYA_PAYOUTS: 'mzaya_payouts',
  PROCUREMENT: 'procurement',
  TREASURY: 'treasury',
  TAX: 'tax',
});

const CUTOVER_MODE = Object.freeze({
  LEGACY: 'legacy',
  SHADOW: 'shadow',
  EVENT_ENGINE: 'event_engine',
  BLOCK_LEGACY: 'block_legacy',
});

const CUTOVER_STATUS = Object.freeze({
  PLANNED: 'planned',
  VALIDATING: 'validating',
  READY: 'ready',
  ACTIVE: 'active',
  ROLLED_BACK: 'rolled_back',
});

module.exports = {
  FINANCE_DOMAIN,
  CUTOVER_MODE,
  CUTOVER_STATUS,
};
