const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceMasterDataRecord', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  domain_id: { type: DataTypes.UUID, allowNull: false },
  record_key: { type: DataTypes.STRING(140), allowNull: false },
  display_name: { type: DataTypes.STRING(220), allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  effective_from: { type: DataTypes.DATEONLY, allowNull: true },
  effective_to: { type: DataTypes.DATEONLY, allowNull: true },
  current_version_id: { type: DataTypes.UUID, allowNull: true },
  source_type: { type: DataTypes.STRING(80), allowNull: true },
  source_id: { type: DataTypes.UUID, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  created_by: { type: DataTypes.UUID, allowNull: true },

}, { tableName: 'finance_master_data_records', underscored: true, timestamps: true });
