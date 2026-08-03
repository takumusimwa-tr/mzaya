const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EliminationEntry = sequelize.define('EliminationEntry', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  consolidation_run_id: { type: DataTypes.UUID, allowNull: false },
  intercompany_transaction_id: { type: DataTypes.UUID, allowNull: true },
  elimination_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  account_code: { type: DataTypes.STRING(80), allowNull: false },
  debit_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  credit_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  description: { type: DataTypes.STRING(500), allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'generated' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'elimination_entries',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = EliminationEntry;
