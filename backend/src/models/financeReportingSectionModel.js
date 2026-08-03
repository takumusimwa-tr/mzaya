const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceReportingSection', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  reporting_pack_id: { type: DataTypes.UUID, allowNull: false },
  section_key: { type: DataTypes.STRING(100), allowNull: false },
  title: { type: DataTypes.STRING(180), allowNull: false },
  section_type: { type: DataTypes.STRING(40), allowNull: false },
  sequence: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
  content: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'ready' },
}, {
  tableName: 'finance_reporting_sections',
  underscored: true,
  timestamps: true,
});
