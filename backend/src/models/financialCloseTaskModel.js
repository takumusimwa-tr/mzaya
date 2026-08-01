const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FinancialCloseTask = sequelize.define('FinancialCloseTask', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  close_cycle_id: { type: DataTypes.UUID, allowNull: false },
  task_key: { type: DataTypes.STRING(100), allowNull: false },
  name: { type: DataTypes.STRING(180), allowNull: false },
  category: { type: DataTypes.STRING(60), allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  sequence: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
  assigned_to: { type: DataTypes.UUID, allowNull: true },
  completed_by: { type: DataTypes.UUID, allowNull: true },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  evidence: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  notes: { type: DataTypes.STRING(1500), allowNull: true },
}, {
  tableName: 'financial_close_tasks',
  underscored: true,
  timestamps: true,
});

module.exports = FinancialCloseTask;
