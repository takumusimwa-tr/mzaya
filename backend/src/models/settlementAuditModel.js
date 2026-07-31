const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SettlementAudit = sequelize.define('SettlementAudit', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  settlement_id: { type: DataTypes.UUID, allowNull: true },
  batch_id: { type: DataTypes.UUID, allowNull: true },
  actor_id: { type: DataTypes.UUID, allowNull: true },
  action: { type: DataTypes.STRING(60), allowNull: false },
  previous_value: { type: DataTypes.JSONB, allowNull: true },
  new_value: { type: DataTypes.JSONB, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'settlement_audit',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = SettlementAudit;
