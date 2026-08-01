const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Stores jurisdiction-specific tax registrations.
 * Registration numbers should be treated as confidential finance data.
 */
const TaxRegistration = sequelize.define('TaxRegistration', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  jurisdiction_id: { type: DataTypes.UUID, allowNull: false },
  registration_type: { type: DataTypes.STRING(40), allowNull: false },
  registration_number: { type: DataTypes.STRING(120), allowNull: false },
  legal_name: { type: DataTypes.STRING(180), allowNull: false },
  effective_from: { type: DataTypes.DATEONLY, allowNull: false },
  effective_to: { type: DataTypes.DATEONLY, allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'tax_registrations',
  underscored: true,
  timestamps: true,
});

module.exports = TaxRegistration;
