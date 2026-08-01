const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BankStatementImport = sequelize.define('BankStatementImport', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  bank_account_id: { type: DataTypes.UUID, allowNull: false },
  import_reference: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  statement_from: { type: DataTypes.DATEONLY, allowNull: true },
  statement_to: { type: DataTypes.DATEONLY, allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  source_format: { type: DataTypes.STRING(20), allowNull: false },
  source_storage_key: { type: DataTypes.TEXT, allowNull: true },
  record_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  imported_by: { type: DataTypes.UUID, allowNull: true },
  imported_at: { type: DataTypes.DATE, allowNull: true },
  error_message: { type: DataTypes.STRING(1000), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'bank_statement_imports',
  underscored: true,
  timestamps: true,
});

module.exports = BankStatementImport;
