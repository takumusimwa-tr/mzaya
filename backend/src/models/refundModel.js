const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Refund = sequelize.define('Refund', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  payment_id: { type: DataTypes.UUID, allowNull: false },
  order_id: { type: DataTypes.UUID, allowNull: true },
  customer_id: { type: DataTypes.UUID, allowNull: false },
  requested_by: { type: DataTypes.UUID, allowNull: false },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  provider: { type: DataTypes.STRING(40), allowNull: true },
  provider_refund_reference: { type: DataTypes.STRING(180), allowNull: true },
  amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  reason: { type: DataTypes.STRING(60), allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'requested' },
  request_notes: { type: DataTypes.STRING(1000), allowNull: true },
  decision_notes: { type: DataTypes.STRING(1000), allowNull: true },
  provider_payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  requested_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  processed_at: { type: DataTypes.DATE, allowNull: true },
  failed_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'refunds',
  underscored: true,
  timestamps: true,
});

module.exports = Refund;
