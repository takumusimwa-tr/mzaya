const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
module.exports = sequelize.define('RecognizedRevenueEvent', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, revenue_schedule_id: { type: DataTypes.UUID, allowNull: false },
  event_type: { type: DataTypes.STRING(30), allowNull: false }, amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false }, ledger_transaction_id: { type: DataTypes.UUID, allowNull: true },
  event_reference: { type: DataTypes.STRING(160), allowNull: false, unique: true }, occurred_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: 'recognized_revenue_events', underscored: true, timestamps: false, createdAt: 'created_at' });
