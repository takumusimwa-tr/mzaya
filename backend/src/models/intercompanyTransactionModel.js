const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const IntercompanyTransaction = sequelize.define('IntercompanyTransaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  intercompany_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  source_entity_id: { type: DataTypes.UUID, allowNull: false },
  counterparty_entity_id: { type: DataTypes.UUID, allowNull: false },
  transaction_type: { type: DataTypes.STRING(50), allowNull: false },
  source_transaction_id: { type: DataTypes.UUID, allowNull: true },
  counterparty_transaction_id: { type: DataTypes.UUID, allowNull: true },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  transaction_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'open' },
  reconciliation_status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'unmatched' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'intercompany_transactions',
  underscored: true,
  timestamps: true,
});

module.exports = IntercompanyTransaction;
