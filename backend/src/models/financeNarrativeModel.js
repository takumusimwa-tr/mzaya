const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceNarrative', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  reporting_pack_id: { type: DataTypes.UUID, allowNull: true },
  section_id: { type: DataTypes.UUID, allowNull: true },
  narrative_type: { type: DataTypes.STRING(40), allowNull: false },
  title: { type: DataTypes.STRING(180), allowNull: true },
  body: { type: DataTypes.TEXT, allowNull: false },
  generated_from: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  authored_by: { type: DataTypes.UUID, allowNull: true },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'draft' },
}, {
  tableName: 'finance_narratives',
  underscored: true,
  timestamps: true,
});
