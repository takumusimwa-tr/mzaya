const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BudgetLine = sequelize.define('BudgetLine', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  budget_version_id: { type: DataTypes.UUID, allowNull: false },
  period_code: { type: DataTypes.STRING(20), allowNull: false },
  account_id: { type: DataTypes.UUID, allowNull: true },
  department_code: { type: DataTypes.STRING(60), allowNull: true },
  cost_center_code: { type: DataTypes.STRING(60), allowNull: true },
  line_type: { type: DataTypes.STRING(40), allowNull: false },
  amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  notes: { type: DataTypes.STRING(500), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'finance_budget_lines',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = BudgetLine;
