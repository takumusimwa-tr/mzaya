const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceMasterDataDomain', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  domain_key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(180), allowNull: false },
  record_type: { type: DataTypes.STRING(80), allowNull: false },
  requires_approval: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  effective_dating: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, { tableName: 'finance_master_data_domains', underscored: true, timestamps: true });
