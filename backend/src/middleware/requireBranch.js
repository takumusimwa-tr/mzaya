/**
 * ============================================================================
 * MZAYA
 * Middleware: Require Branch
 * Path: backend/src/middleware/requireBranch.js
 * ----------------------------------------------------------------------------
 * Loads a vendor branch once, enforces ownership, and exposes it as req.branch.
 * Administrators may access any branch. Vendor owners may access only their own.
 * ============================================================================
 */

const { Vendor } = require('../models/associations');
const { USER_ROLE } = require('../config/constants');
const { logger } = require('../utils/logger');

function branchIdFrom(req, source, key) {
  if (source === 'params') return req.params?.[key];
  if (source === 'query') return req.query?.[key];
  if (source === 'body') return req.body?.[key];
  return undefined;
}

function requireBranch({
  source = 'params',
  key = 'id',
  allowAdmin = true,
  requireActive = false,
} = {}) {
  return async (req, res, next) => {
    try {
      const branchId = branchIdFrom(req, source, key);

      if (!branchId) {
        return res.status(400).json({ error: `${key} is required` });
      }

      const branch = await Vendor.findByPk(branchId);
      if (!branch) {
        return res.status(404).json({ error: 'Branch not found' });
      }

      const isAdmin = allowAdmin && req.user?.role === USER_ROLE.ADMIN;
      const isOwner = branch.owner_id === req.user?.id;

      if (!isAdmin && !isOwner) {
        logger.warn('branch_access_denied', {
          reqId: req.id,
          userId: req.user?.id,
          role: req.user?.role,
          branchId,
          path: req.originalUrl,
        });
        return res.status(403).json({ error: 'Access denied' });
      }

      if (requireActive && !branch.is_active) {
        return res.status(409).json({ error: 'Branch is not active' });
      }

      req.branch = branch;
      req.branchId = branch.id;
      return next();
    } catch (error) {
      logger.error('require_branch_error', {
        reqId: req.id,
        userId: req.user?.id,
        error: error.message,
      });
      return next(error);
    }
  };
}

module.exports = { requireBranch };
