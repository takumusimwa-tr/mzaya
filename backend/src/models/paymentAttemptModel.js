const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// An immutable record of one attempt to take payment for an order.
//
// Previously, payment state was written directly onto the order and overwritten
// on each attempt. That meant:
//   • a double-tap fired two provider calls (two USSD prompts, possible double
//     charge),
//   • a retried webhook could repeat side effects,
//   • an out-of-order provider event could move a PAID order backwards,
//   • and when a customer disputed a charge there was no trail to investigate.
//
// Attempts are append-only. The order's paid state is DERIVED from whether any
// attempt succeeded — never assigned by whichever event happened to arrive last.
const PaymentAttempt = sequelize.define('PaymentAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  // Client-supplied (or server-derived) key that makes initiation idempotent.
  // The same key always returns the same attempt instead of calling the provider
  // again — so a double-tap, a proxy retry, or an offline replay can only ever
  // produce ONE prompt.
  idempotency_key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  // What we asked the provider for. Snapshotted, so later edits to the order
  // can't rewrite history.
  amount_usd: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency:   { type: DataTypes.STRING, allowNull: false, defaultValue: 'USD' },
  method:     { type: DataTypes.STRING, allowNull: false },

  // The number the USSD prompt was actually sent to (mobile money only).
  // Masked in logs and in API responses.
  payment_phone: { type: DataTypes.STRING, allowNull: true },

  // Provider identifiers.
  provider:          { type: DataTypes.STRING, allowNull: false, defaultValue: 'paynow' },
  provider_reference:{ type: DataTypes.STRING, allowNull: true },
  poll_url:          { type: DataTypes.STRING, allowNull: true },
  redirect_url:      { type: DataTypes.STRING, allowNull: true },

  // pending → success | failed | cancelled. Never regresses (see the transition
  // guard in payment.controller.js).
  //
  // Deliberately STRING + validation rather than a Postgres ENUM. The migration
  // defines this as varchar with a CHECK constraint, and a Sequelize ENUM would
  // try to convert it on every dev sync (Postgres cannot cast the existing
  // default automatically — it errors). A varchar is also far easier to evolve:
  // adding a status later is a CHECK edit, not an ALTER TYPE dance.
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: { isIn: [['pending', 'success', 'failed', 'cancelled']] },
  },

  // Hash of the last raw provider payload — lets support prove what the provider
  // actually said, without storing a blob of PII.
  provider_payload_hash: { type: DataTypes.STRING, allowNull: true },

  resolved_at: { type: DataTypes.DATE, allowNull: true },

  // Finance cutover state. The canonical payment entity in the live codebase
  // is PaymentAttempt; older finance scaffolding referred to it as Payment.
  finance_reconciliation_status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'pending',
  },
  finance_last_reconciled_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  finance_metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  provider_payload: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
}, {
  tableName: 'payment_attempts',
  timestamps: true,
  indexes: [
    { fields: ['order_id'] },
    { unique: true, fields: ['idempotency_key'] },
    { fields: ['provider_reference'] },
  ],
});

module.exports = PaymentAttempt;
