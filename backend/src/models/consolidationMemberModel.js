const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ConsolidationMember = sequelize.define('ConsolidationMember', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  consolidation_group_id: { type: DataTypes.UUID, allowNull: false },
  legal_entity_id: { type: DataTypes.UUID, allowNull: false },
  ownership_ratio: { type: DataTypes.DECIMAL(8, 6), allowNull: false, defaultValue: 1 },
  consolidation_method: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'full' },
  effective_from: { type: DataTypes.DATEONLY, allowNull: false },
  effective_to: { type: DataTypes.DATEONLY, allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
}, {
  tableName: 'consolidation_members',
  underscored: true,
  timestamps: true,
});

module.exports = ConsolidationMember;
