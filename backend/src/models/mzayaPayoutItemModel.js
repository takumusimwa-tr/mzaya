const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('MzayaPayoutItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  payout_id: { type: DataTypes.UUID, allowNull: false },
  order_id: { type: DataTypes.UUID, allowNull: true },
  order_type: { type: DataTypes.STRING(40), allowNull: true },
  delivery_earning_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  tip_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  incentive_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  reimbursement_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  penalty_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  withholding_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  adjustment_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  net_due_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'mzaya_payout_items',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});
