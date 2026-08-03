const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceReportingPack', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  pack_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  pack_type: { type: DataTypes.STRING(30), allowNull: false },
  title: { type: DataTypes.STRING(220), allowNull: false },
  period_from: { type: DataTypes.DATEONLY, allowNull: false },
  period_to: { type: DataTypes.DATEONLY, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  generated_by: { type: DataTypes.UUID, allowNull: true },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  generated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  export_storage_key: { type: DataTypes.TEXT, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'finance_reporting_packs',
  underscored: true,
  timestamps: true,
});
