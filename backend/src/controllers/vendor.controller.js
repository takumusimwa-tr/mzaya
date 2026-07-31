/**
 * Thin HTTP adapter for vendor discovery, onboarding and settings.
 */

const vendorService = require('../services/vendor.service');
const branchService = require('../services/branch.service');
const { sendServiceError } = require('../utils/serviceError');

async function listVendors(req, res, next) {
  try {
    const vendors = await vendorService.listVendors(req.query);
    return res.status(200).json({ vendors });
  } catch (error) {
    return next(error);
  }
}

async function getMyVendor(req, res, next) {
  try {
    const vendor = await vendorService.getOwnerVendor(
      req.user.id,
      req.query.branch_id
    );
    return res.status(200).json({ vendor });
  } catch (error) {
    if (sendServiceError(error, res)) return undefined;
    return next(error);
  }
}

async function myBranches(req, res, next) {
  try {
    const branches = await branchService.getOwnerBranches(req.user.id);
    return res.status(200).json({ branches });
  } catch (error) {
    return next(error);
  }
}

async function addBranch(req, res, next) {
  try {
    const branch = await branchService.createBranchForOwner(
      req.user.id,
      req.body
    );
    return res.status(201).json({
      message: 'Branch added — pending approval',
      branch,
    });
  } catch (error) {
    if (sendServiceError(error, res)) return undefined;
    return next(error);
  }
}

async function getVendor(req, res, next) {
  try {
    const vendor = await vendorService.getPublicVendor(req.params.id);
    return res.status(200).json({ vendor });
  } catch (error) {
    if (sendServiceError(error, res)) return undefined;
    return next(error);
  }
}

async function createVendor(req, res, next) {
  try {
    const result = await vendorService.createVendor(req.user.id, req.body);
    return res.status(201).json({
      message: 'Business registered — pending approval',
      ...result,
    });
  } catch (error) {
    if (sendServiceError(error, res)) return undefined;
    return next(error);
  }
}

async function updateVendor(req, res, next) {
  try {
    const vendor = await vendorService.updateVendor(
      req.params.id,
      req.user,
      req.body
    );
    return res.status(200).json({ vendor });
  } catch (error) {
    if (sendServiceError(error, res)) return undefined;
    return next(error);
  }
}

module.exports = {
  listVendors,
  getMyVendor,
  myBranches,
  addBranch,
  getVendor,
  createVendor,
  updateVendor,
};
