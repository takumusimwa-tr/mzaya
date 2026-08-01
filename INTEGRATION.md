# Mzaya Batch 08.2.3 — Financial Controls & Approval Governance

This batch introduces maker-checker controls, approval policies, thresholds,
control exceptions, and administrator review workflows.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/financial_controls_governance.sql
```

## Model integration

Export the four models from `financialControlModels.js` through the existing
associations module and add:

```js
FinancialApprovalRequest.belongsTo(FinancialControlPolicy, {
  foreignKey: 'policy_id',
  as: 'policy',
});

FinancialApprovalRequest.hasMany(FinancialApprovalDecision, {
  foreignKey: 'approval_request_id',
  as: 'decisions',
});
```

## Route mount

```js
app.use('/api/financial-controls', require('./routes/financialControl.routes'));
```

## Recommended protected actions

- high-value refunds
- settlement submissions
- financial-period reopening
- manual ledger adjustments
- tax-return submission
- reconciliation overrides
- payout destination changes

## Maker-checker behavior

When `require_distinct_creator=true`, the request creator cannot approve the
same action. Policies can require multiple approvals and specific roles.

## Frontend route

```jsx
<Route path="/admin/finance/controls" element={<FinancialControlsDashboard />} />
```

## Verification

```bash
cd backend
npm test -- financialApproval.test.js
node --check src/services/financialApproval.service.js
npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```
