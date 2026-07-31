const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FinancialPeriod = sequelize.define('FinancialPeriod', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'open' },
  closed_by: { type: DataTypes.UUID, allowNull: true },
  closed_at: { type: DataTypes.DATE, allowNull: true },
  reopened_by: { type: DataTypes.UUID, allowNull: true },
  reopened_at: { type: DataTypes.DATE, allowNull: true },
  notes: { type: DataTypes.STRING(1000), allowNull: true },
}, {
  tableName: 'financial_periods',
  underscored: true,
  timestamps: true,
});

module.exports = FinancialPeriod;
