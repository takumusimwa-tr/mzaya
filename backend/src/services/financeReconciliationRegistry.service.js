const {
  PaymentFinanceReconciliationResult,
  OrderFinanceReconciliationResult,
  VendorSettlementFinanceReconciliationResult,
  MzayaPayoutFinanceReconciliationResult,
  ProcurementFinanceReconciliationResult,
  TreasuryFinanceReconciliationResult,
  TaxFinanceReconciliationResult,
} = require('../models/associations');
const { FINANCE_DOMAIN } = require('../config/financeCutover.constants');

const registry = Object.freeze({
  [FINANCE_DOMAIN.PAYMENTS]: {
    model: PaymentFinanceReconciliationResult,
    evaluatedAt: 'evaluated_at',
  },
  [FINANCE_DOMAIN.ORDERS]: {
    model: OrderFinanceReconciliationResult,
    evaluatedAt: 'evaluated_at',
  },
  [FINANCE_DOMAIN.VENDOR_SETTLEMENTS]: {
    model: VendorSettlementFinanceReconciliationResult,
    evaluatedAt: 'evaluated_at',
  },
  [FINANCE_DOMAIN.MZAYA_PAYOUTS]: {
    model: MzayaPayoutFinanceReconciliationResult,
    evaluatedAt: 'evaluated_at',
  },
  [FINANCE_DOMAIN.PROCUREMENT]: {
    model: ProcurementFinanceReconciliationResult,
    evaluatedAt: 'evaluated_at',
  },
  [FINANCE_DOMAIN.TREASURY]: {
    model: TreasuryFinanceReconciliationResult,
    evaluatedAt: 'evaluated_at',
  },
  [FINANCE_DOMAIN.TAX]: {
    model: TaxFinanceReconciliationResult,
    evaluatedAt: 'evaluated_at',
  },
});

function getReconciliationAdapter(domainKey) {
  const adapter = registry[domainKey];
  if (!adapter) {
    const error = new Error(`Unknown finance reconciliation domain: ${domainKey}`);
    error.status = 422;
    error.code = 'UNKNOWN_FINANCE_RECONCILIATION_DOMAIN';
    throw error;
  }
  return adapter;
}

function listReconciliationDomains() {
  return Object.keys(registry);
}

module.exports = {
  getReconciliationAdapter,
  listReconciliationDomains,
};
