const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TaxFilingPeriod = sequelize.define('TaxFilingPeriod', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  jurisdiction_id: { type: DataTypes.UUID, allowNull: false },
  tax_type: { type: DataTypes.STRING(40), allowNull: false },
  period_code: { type: DataTypes.STRING(30), allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  due_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'open' },
  locked_at: { type: DataTypes.DATE, allowNull: true },
  filed_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'tax_filing_periods',
  underscored: true,
  timestamps: true,
});

module.exports = TaxFilingPeriod;
