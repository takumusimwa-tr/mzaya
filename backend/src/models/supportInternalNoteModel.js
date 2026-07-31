const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SupportInternalNote = sequelize.define('SupportInternalNote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  ticket_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  author_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
}, {
  tableName: 'support_internal_notes',
  underscored: true,
  timestamps: true,
});

module.exports = SupportInternalNote;
