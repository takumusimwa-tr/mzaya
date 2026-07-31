/**
 * Thin HTTP adapter for vendor menu mutations.
 */

const menuService = require('../services/menu.service');
const { sendServiceError } = require('../utils/serviceError');

async function addMenuItem(req, res, next) {
  try {
    const item = await menuService.createMenuItem(
      req.params.id,
      req.user,
      req.body
    );
    return res.status(201).json({ item });
  } catch (error) {
    if (sendServiceError(error, res)) return undefined;
    return next(error);
  }
}

async function updateMenuItem(req, res, next) {
  try {
    const item = await menuService.updateMenuItem(
      req.params.id,
      req.params.itemId,
      req.user,
      req.body
    );
    return res.status(200).json({ item });
  } catch (error) {
    if (sendServiceError(error, res)) return undefined;
    return next(error);
  }
}

async function deleteMenuItem(req, res, next) {
  try {
    await menuService.deleteMenuItem(
      req.params.id,
      req.params.itemId,
      req.user
    );
    return res.status(200).json({ message: 'Item deleted' });
  } catch (error) {
    if (sendServiceError(error, res)) return undefined;
    return next(error);
  }
}

module.exports = {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
