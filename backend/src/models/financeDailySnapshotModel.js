const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Daily aggregate for executive finance reporting.
 * This table intentionally stores totals only and never message or payment
 * payloads, preserving a clean analytical boundary.
 */
const FinanceDailySnapshot = sequelize.define('FinanceDailySnapshot', {
  snapshot_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    primaryKey: true,
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    primaryKey: true,
  },
  gmv_minor: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  platform_revenue_minor: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  vendor_payable_minor: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  mzaya_payable_minor: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  refunds_minor: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  chargebacks_minor: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  settlements_paid_minor: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  settlements_pending_minor: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  reconciliation_matched_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  reconciliation_exception_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
}, {
  tableName: 'finance_daily_snapshots',
  underscored: true,
  timestamps: true,
});

module.exports = FinanceDailySnapshot;
