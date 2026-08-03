# Mzaya Batch 08.4.5 — Finance Audit, Controls Testing & Evidence Management

This batch adds the assurance layer across financial controls, ledger,
treasury, reconciliation, settlements, revenue, tax, close, reporting,
and management actions.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/finance_audit_assurance.sql
```

## Register and export models

- `FinanceAuditPlan`
- `FinanceAuditEngagement`
- `FinanceAuditProcedure`
- `FinanceControlAssessment`
- `FinanceAuditSample`
- `FinanceAuditEvidence`
- `FinanceAuditFinding`
- `FinanceRemediationAction`
- `FinanceContinuousControlResult`

Required associations:

```js
FinanceAuditPlan.hasMany(FinanceAuditEngagement, {
  foreignKey: 'audit_plan_id',
  as: 'engagements',
});

FinanceAuditEngagement.hasMany(FinanceAuditProcedure, {
  foreignKey: 'engagement_id',
  as: 'procedures',
});

FinanceAuditFinding.hasMany(FinanceRemediationAction, {
  foreignKey: 'finding_id',
  as: 'remediationActions',
});
```

## Route mounts

```js
app.use(
  '/api/finance-audit',
  require('./routes/financeAudit.routes')
);

app.use(
  '/api/finance-audit-findings',
  require('./routes/financeAuditFinding.routes')
);

app.use(
  '/api/finance-remediation',
  require('./routes/financeRemediation.routes')
);
```

All routes are administrator-only. Production should introduce dedicated
auditor and audit-manager roles with segregation from transaction operators.

## Standard control areas

```text
financial_controls
ledger
treasury
settlements
revenue
tax
close
reporting
```

## Continuous control testing

The included tests cover:

- maker-checker separation
- posted ledger transaction balancing

Extend the same pattern for:

- expired approval execution
- bank-reconciliation completeness
- settlement completeness
- revenue-recognition reversals
- tax filing deadlines
- close-task evidence
- reporting-pack approval
- treasury-transfer idempotency

## Jobs

```js
const {
  startContinuousControlTestingJob,
} = require('./jobs/continuousControlTesting.job');

const {
  startRemediationReminderJob,
} = require('./jobs/remediationReminder.job');

const continuousControlTestingJob =
  startContinuousControlTestingJob({ logger });

const remediationReminderJob =
  startRemediationReminderJob({ logger });
```

## Socket.IO

```js
const {
  initializeFinanceAuditEventBridge,
} = require('./realtime/financeAuditEventBridge');

const closeFinanceAuditBridge =
  initializeFinanceAuditEventBridge(io);
```

Call the cleanup function during graceful shutdown.

## Frontend routes

```jsx
<Route
  path="/admin/finance/audit"
  element={<FinanceAuditDashboard />}
/>

<Route
  path="/admin/finance/audit/findings"
  element={<FinanceFindingsDashboard />}
/>

<Route
  path="/admin/finance/audit/remediation"
  element={<RemediationDashboard />}
/>
```

## Evidence controls

- Store files in private, access-controlled storage.
- Preserve content hashes.
- Record source type and source identifier.
- Apply retention dates.
- Never overwrite collected evidence.
- Keep evidence links immutable after engagement completion.
- Log access to restricted evidence.

## Finding and remediation workflow

```text
finding raised
      ↓
management response
      ↓
remediation assigned
      ↓
completed with evidence
      ↓
independent verification
      ↓
finding closed
```

The remediation completer cannot verify the same action.

## Important limitation

This package is an internal audit and assurance workflow foundation. It does
not provide an external audit opinion and does not replace professional
auditors, statutory requirements, or approved internal-audit methodology.

## Verification

```bash
cd backend
npm test -- controlAssessment.test.js
npm test -- auditSampling.test.js
npm test -- remediation.test.js
node --check src/services/financeControlAssessment.service.js
node --check src/services/financeEvidence.service.js
node --check src/services/financeRemediation.service.js
node --check src/services/continuousControlTesting.service.js
npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```
