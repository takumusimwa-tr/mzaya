const { Op, literal } = require('sequelize');
const {
  LedgerTransaction,
  LedgerEntry,
  PaymentAccount,
  Refund,
  Chargeback,
  Settlement,
  PaymentReconciliationRecord,
} = require('../models/associations');

/**
 * Returns current operational finance totals directly from source tables.
 * Historical charting should prefer finance_daily_snapshots.
 */
async function getFinanceMetrics({
  currency,
  startDate,
  endDate,
}) {
  const normalizedCurrency = String(currency).toUpperCase();
  const occurredAt = {
    [Op.between]: [
      new Date(`${startDate}T00:00:00.000Z`),
      new Date(`${endDate}T23:59:59.999Z`),
    ],
  };

  const transactionWhere = {
    currency: normalizedCurrency,
    occurred_at: occurredAt,
    status: 'posted',
  };

  const [
    gmvMinor,
    platformRevenueMinor,
    refundsMinor,
    chargebacksMinor,
    settlementsPaidMinor,
    settlementsPendingMinor,
    matchedCount,
    exceptionCount,
  ] = await Promise.all([
    LedgerEntry.sum('amount_minor', {
      include: [{
        model: LedgerTransaction,
        as: 'transaction',
        required: true,
        where: {
          ...transactionWhere,
          transaction_type: 'order_payment',
        },
      }],
      where: { direction: 'debit' },
    }),
    LedgerEntry.sum('amount_minor', {
      include: [
        {
          model: LedgerTransaction,
          as: 'transaction',
          required: true,
          where: {
            ...transactionWhere,
            transaction_type: 'order_payment',
          },
        },
        {
          model: PaymentAccount,
          as: 'account',
          required: true,
          where: {
            account_type: 'service_fee_revenue',
            currency: normalizedCurrency,
          },
        },
      ],
      where: { direction: 'credit' },
    }),
    Refund.sum('amount_minor', {
      where: {
        currency: normalizedCurrency,
        status: 'processed',
        processed_at: occurredAt,
      },
    }),
    Chargeback.sum('amount_minor', {
      where: {
        currency: normalizedCurrency,
        status: { [Op.in]: ['received', 'under_review', 'lost'] },
        created_at: occurredAt,
      },
    }),
    Settlement.sum('net_minor', {
      where: {
        currency: normalizedCurrency,
        status: 'paid',
        paid_at: occurredAt,
      },
    }),
    Settlement.sum('net_minor', {
      where: {
        currency: normalizedCurrency,
        status: { [Op.in]: ['pending', 'submitted'] },
      },
    }),
    PaymentReconciliationRecord.count({
      where: {
        currency: normalizedCurrency,
        reconciliation_status: 'matched',
        created_at: occurredAt,
      },
    }),
    PaymentReconciliationRecord.count({
      where: {
        currency: normalizedCurrency,
        reconciliation_status: {
          [Op.in]: ['unmatched', 'discrepancy'],
        },
        created_at: occurredAt,
      },
    }),
  ]);

  return {
    currency: normalizedCurrency,
    gmvMinor: Number(gmvMinor || 0),
    platformRevenueMinor: Number(platformRevenueMinor || 0),
    refundsMinor: Number(refundsMinor || 0),
    chargebacksMinor: Number(chargebacksMinor || 0),
    settlementsPaidMinor: Number(settlementsPaidMinor || 0),
    settlementsPendingMinor: Number(settlementsPendingMinor || 0),
    reconciliationMatchedCount: matchedCount,
    reconciliationExceptionCount: exceptionCount,
  };
}

module.exports = {
  getFinanceMetrics,
};
