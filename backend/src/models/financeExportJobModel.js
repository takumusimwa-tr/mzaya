const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Tracks asynchronous finance exports so large reports do not block API
 * requests. Storage keys should point to private, time-limited files.
 */
const FinanceExportJob = sequelize.define('FinanceExportJob', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  requested_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  export_type: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  format: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'pending',
  },
  filters: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  storage_key: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  error_message: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'finance_export_jobs',
  underscored: true,
  timestamps: true,
});

module.exports = FinanceExportJob;
