const {
  FinanceCutoverControl,
  FinanceCutoverDecision,
  FinanceCutoverReadinessCheck,
  FinanceLegacyPostingAttempt,
} = require('../models/associations');
const {
  evaluateCutoverReadiness,
} = require('../services/financeCutoverReadiness.service');
const {
  requestCutover,
  approveCutover,
  rollbackCutover,
} = require('../services/financeCutover.service');

async function dashboard(req, res, next) {
  try {
    const [controls, decisions, checks, legacyAttempts] = await Promise.all([
      FinanceCutoverControl.findAll({
        order: [['domain_key', 'ASC'], ['control_key', 'ASC']],
      }),
      FinanceCutoverDecision.findAll({
        order: [['requested_at', 'DESC']],
        limit: 100,
      }),
      FinanceCutoverReadinessCheck.findAll({
        order: [['evaluated_at', 'DESC']],
        limit: 300,
      }),
      FinanceLegacyPostingAttempt.findAll({
        order: [['attempted_at', 'DESC']],
        limit: 100,
      }),
    ]);

    return res.status(200).json({
      controls,
      decisions,
      checks,
      legacyAttempts,
    });
  } catch (error) {
    return next(error);
  }
}

async function readiness(req, res, next) {
  try {
    const control = await FinanceCutoverControl.findByPk(
      req.params.controlId
    );

    if (!control) {
      return res.status(404).json({
        error: 'Finance cutover control not found',
      });
    }

    return res.status(200).json(
      await evaluateCutoverReadiness(control)
    );
  } catch (error) {
    return next(error);
  }
}

async function request(req, res, next) {
  try {
    return res.status(201).json(
      await requestCutover({
        controlId: req.params.controlId,
        requestedBy: req.user.id,
        reason: req.body.reason,
      })
    );
  } catch (error) {
    return next(error);
  }
}

async function approve(req, res, next) {
  try {
    return res.status(200).json(
      await approveCutover({
        decisionId: req.params.decisionId,
        approvedBy: req.user.id,
      })
    );
  } catch (error) {
    return next(error);
  }
}

async function rollback(req, res, next) {
  try {
    const control = await rollbackCutover({
      controlId: req.params.controlId,
      rolledBackBy: req.user.id,
      reason: req.body.reason,
    });

    return res.status(200).json({ control });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  dashboard,
  readiness,
  request,
  approve,
  rollback,
};
