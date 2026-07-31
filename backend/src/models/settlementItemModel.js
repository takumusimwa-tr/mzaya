const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SettlementItem = sequelize.define('SettlementItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  settlement_id: { type: DataTypes.UUID, allowNull: false },
  source_transaction_id: { type: DataTypes.UUID, allowNull: false },
  source_entry_id: { type: DataTypes.UUID, allowNull: false },
  order_id: { type: DataTypes.UUID, allowNull: true },
  amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  item_type: { type: DataTypes.STRING(40), allowNull: false },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'settlement_items',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = SettlementItem;
