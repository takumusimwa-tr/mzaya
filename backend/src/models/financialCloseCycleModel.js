const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FinancialCloseCycle = sequelize.define('FinancialCloseCycle', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  period_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  close_reference: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'open' },
  started_by: { type: DataTypes.UUID, allowNull: true },
  started_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  completed_by: { type: DataTypes.UUID, allowNull: true },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  reopened_by: { type: DataTypes.UUID, allowNull: true },
  reopened_at: { type: DataTypes.DATE, allowNull: true },
  notes: { type: DataTypes.STRING(1500), allowNull: true },
}, {
  tableName: 'financial_close_cycles',
  underscored: true,
  timestamps: true,
});

module.exports = FinancialCloseCycle;
