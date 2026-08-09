const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('PaymentRefund', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  payment_id: { type: DataTypes.UUID, allowNull: false },
  refund_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  provider_refund_reference: { type: DataTypes.STRING(180), allowNull: true },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  reason: { type: DataTypes.STRING(500), allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'requested' },
  requested_by: { type: DataTypes.UUID, allowNull: true },
  requested_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  failed_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'payment_refunds',
  underscored: true,
  timestamps: true,
});
