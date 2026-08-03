const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ConsolidationGroup = sequelize.define('ConsolidationGroup', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  group_code: { type: DataTypes.STRING(60), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(180), allowNull: false },
  parent_entity_id: { type: DataTypes.UUID, allowNull: false },
  reporting_currency: { type: DataTypes.STRING(3), allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'consolidation_groups',
  underscored: true,
  timestamps: true,
});

module.exports = ConsolidationGroup;
