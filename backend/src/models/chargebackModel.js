const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Chargeback = sequelize.define('Chargeback', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  payment_id: { type: DataTypes.UUID, allowNull: false },
  order_id: { type: DataTypes.UUID, allowNull: true },
  provider: { type: DataTypes.STRING(40), allowNull: false },
  provider_case_reference: { type: DataTypes.STRING(180), allowNull: false },
  amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  reason_code: { type: DataTypes.STRING(80), allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'received' },
  response_due_at: { type: DataTypes.DATE, allowNull: true },
  represented_at: { type: DataTypes.DATE, allowNull: true },
  won_at: { type: DataTypes.DATE, allowNull: true },
  lost_at: { type: DataTypes.DATE, allowNull: true },
  provider_payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'chargebacks',
  underscored: true,
  timestamps: true,
});

module.exports = Chargeback;
