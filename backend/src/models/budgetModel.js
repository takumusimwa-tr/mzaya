const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Budget = sequelize.define('Budget', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  budget_code: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(180), allowNull: false },
  budget_type: { type: DataTypes.STRING(30), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  fiscal_year: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  owner_id: { type: DataTypes.UUID, allowNull: true },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'finance_budgets',
  underscored: true,
  timestamps: true,
});

module.exports = Budget;
