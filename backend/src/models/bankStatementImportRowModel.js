const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BankStatementImportRow = sequelize.define('BankStatementImportRow', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  statement_import_id: { type: DataTypes.UUID, allowNull: false },
  row_number: { type: DataTypes.INTEGER, allowNull: false },
  raw_data: { type: DataTypes.JSONB, allowNull: false },
  normalized_data: { type: DataTypes.JSONB, allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  error_message: { type: DataTypes.STRING(1000), allowNull: true },
}, {
  tableName: 'bank_statement_import_rows',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = BankStatementImportRow;
