const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceMasterDataVersion', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  record_id: { type: DataTypes.UUID, allowNull: false },
  version_number: { type: DataTypes.INTEGER, allowNull: false },
  payload: { type: DataTypes.JSONB, allowNull: false },
  payload_hash: { type: DataTypes.STRING(128), allowNull: false },
  change_summary: { type: DataTypes.STRING(1000), allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft' },
  effective_from: { type: DataTypes.DATEONLY, allowNull: true },
  effective_to: { type: DataTypes.DATEONLY, allowNull: true },
  created_by: { type: DataTypes.UUID, allowNull: true },
  approved_by: { type: DataTypes.UUID, allowNull: true },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  activated_at: { type: DataTypes.DATE, allowNull: true },
  superseded_at: { type: DataTypes.DATE, allowNull: true },

}, { tableName: 'finance_master_data_versions', underscored: true, timestamps: true });
