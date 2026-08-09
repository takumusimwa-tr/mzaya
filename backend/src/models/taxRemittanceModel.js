const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('TaxRemittance', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  remittance_reference: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  liability_id: { type: DataTypes.UUID, allowNull: false },
  treasury_transfer_id: { type: DataTypes.UUID, allowNull: true },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  amount_minor: { type: DataTypes.BIGINT, allowNull: false },
  provider_reference: { type: DataTypes.STRING(180), allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  initiated_by: { type: DataTypes.UUID, allowNull: true },
  initiated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  paid_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'tax_remittances',
  underscored: true,
  timestamps: true,
});
