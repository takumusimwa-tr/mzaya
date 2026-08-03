const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LegalEntity = sequelize.define('LegalEntity', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  entity_code: { type: DataTypes.STRING(60), allowNull: false, unique: true },
  legal_name: { type: DataTypes.STRING(180), allowNull: false },
  entity_type: { type: DataTypes.STRING(40), allowNull: false },
  country_code: { type: DataTypes.STRING(2), allowNull: false },
  functional_currency: { type: DataTypes.STRING(3), allowNull: false },
  reporting_currency: { type: DataTypes.STRING(3), allowNull: true },
  parent_entity_id: { type: DataTypes.UUID, allowNull: true },
  ownership_ratio: { type: DataTypes.DECIMAL(8, 6), allowNull: false, defaultValue: 1 },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'legal_entities',
  underscored: true,
  timestamps: true,
});

module.exports = LegalEntity;
