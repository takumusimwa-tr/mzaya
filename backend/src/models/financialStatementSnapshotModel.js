const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FinancialStatementSnapshot = sequelize.define('FinancialStatementSnapshot', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  close_cycle_id: { type: DataTypes.UUID, allowNull: false },
  statement_type: { type: DataTypes.STRING(40), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  statement_data: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  generated_by: { type: DataTypes.UUID, allowNull: true },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  generated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  approved_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'financial_statement_snapshots',
  underscored: true,
  timestamps: true,
});

module.exports = FinancialStatementSnapshot;
