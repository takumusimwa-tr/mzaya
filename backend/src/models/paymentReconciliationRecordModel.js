const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Stores provider statement lines and the result of matching each line to an
 * internal payment or ledger transaction.
 */
const PaymentReconciliationRecord = sequelize.define(
  'PaymentReconciliationRecord',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    provider: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    provider_reference: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    internal_reference: {
      type: DataTypes.STRING(180),
      allowNull: true,
    },
    record_type: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    provider_amount_minor: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    internal_amount_minor: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    reconciliation_status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'unmatched',
    },
    discrepancy_minor: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    provider_payload: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    reconciled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewed_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    review_notes: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
  },
  {
    tableName: 'payment_reconciliation_records',
    underscored: true,
    timestamps: true,
  }
);

module.exports = PaymentReconciliationRecord;
