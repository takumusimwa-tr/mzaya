const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GroupReportSnapshot = sequelize.define('GroupReportSnapshot', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  consolidation_run_id: { type: DataTypes.UUID, allowNull: false },
  report_type: { type: DataTypes.STRING(40), allowNull: false },
  reporting_currency: { type: DataTypes.STRING(3), allowNull: false },
  version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  report_data: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  generated_by: { type: DataTypes.UUID, allowNull: true },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  generated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  approved_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'group_report_snapshots',
  underscored: true,
  timestamps: true,
});

module.exports = GroupReportSnapshot;
