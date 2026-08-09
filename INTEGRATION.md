# Mzaya Batch 08.5.8 — Cross-domain Reconciliation & Finance Cutover

This batch closes the 08.5 operational-finance integration sequence.

Its purpose is not to add another accounting subsystem.

Its purpose is to prove that the new event-driven finance path is reliable,
then retire legacy direct-ledger writes in a controlled way.

## Domains covered

```text
payments
orders
vendor_settlements
mzaya_payouts
procurement
treasury
tax
```

## Database

```bash
psql "$DATABASE_URL" \
  -f backend/migrations/finance_cross_domain_cutover.sql
```

## Models

Export:

```js
FinanceDomainReconciliationSnapshot
FinanceCutoverControl
FinanceCutoverReadinessCheck
FinanceCutoverDecision
FinanceLegacyPostingAttempt
FinanceCrossDomainReconciliationRun
FinanceCrossDomainReconciliationException
```

Recommended associations:

```js
FinanceCutoverControl.hasMany(FinanceCutoverReadinessCheck, {
  foreignKey: 'control_id',
  as: 'readinessChecks',
});

FinanceCutoverControl.hasMany(FinanceCutoverDecision, {
  foreignKey: 'control_id',
  as: 'decisions',
});

FinanceCrossDomainReconciliationRun.hasMany(
  FinanceCrossDomainReconciliationException,
  {
    foreignKey: 'run_id',
    as: 'exceptions',
  }
);
```

## Route mounts

```js
app.use(
  '/api/finance-cutover',
  require('./routes/financeCutover.routes')
);

app.use(
  '/api/finance-cross-domain-reconciliation',
  require('./routes/financeCrossDomainReconciliation.routes')
);
```

## Seed cutover controls

Load:

```text
backend/src/config/financeCutover.seed.js
```

Create one control per finance domain.

Do not activate them all at once.

Recommended order:

```text
1. payments
2. orders
3. vendor_settlements
4. mzaya_payouts
5. procurement
6. treasury
7. tax
```

Treasury and tax should cut over later because they affect real cash and
statutory accounting.

## Cutover modes

```text
legacy
  Existing direct-ledger behavior still allowed.

shadow
  Event engine runs and reconciles, but legacy path remains available.

event_engine
  Event engine is authoritative.

block_legacy
  Direct ledger writes are explicitly rejected.
```

Recommended migration:

```text
legacy
  ↓
shadow
  ↓
readiness checks
  ↓
maker-checker approval
  ↓
block_legacy
```

## Readiness requirements

The default readiness checks require:

```text
domain reconciliation match rate >= 99.5%
domain reconciliation exceptions = 0
finance dead letters = 0
pending/retry outbox backlog = 0
cross-domain blocking exceptions = 0
```

Tune thresholds only through a documented finance change decision.

Do not lower thresholds simply to force a cutover.

## Cross-domain reconciliation

The run aggregates every reconciliation layer created during 08.5:

```text
payment -> finance
order -> finance
vendor settlement -> finance
Mzaya payout -> finance
procurement -> finance
treasury -> finance -> bank
tax -> finance
```

It also checks event-pipeline cardinality:

```text
published outbox
finance business events
accounting events
```

The counts are an integrity signal, not a perfect one-to-one accounting proof,
because some event types may legitimately be non-posting/trace events.
Refine per-event expectations during production hardening.

## Legacy direct-ledger guard

The most important integration file is:

```text
backend/src/services/finance/legacyLedgerGuard.integration.example.js
```

Before every remaining direct call to the legacy ledger writer:

```js
await guardLegacyLedgerPost({
  domainKey: 'payments',
  action: 'postPaymentJournal',
  recordId: payment.id,
  userId: req.user?.id,
  payload: {
    paymentId: payment.id,
  },
});
```

Once the domain control is in `block_legacy` mode:

```text
LEGACY_LEDGER_POSTING_DISABLED
```

must be returned.

Do not silently fall back to the old ledger path.

## Critical source-code audit before production cutover

Search the live backend for all direct ledger mutation paths.

Examples:

```bash
grep -R "LedgerTransaction.create" backend/src
grep -R "ledger.*create" backend/src
grep -R "postJournal" backend/src
grep -R "createJournal" backend/src
grep -R "ledgerService" backend/src
grep -R "ledger_transactions" backend/src
```

Classify every result:

```text
A. legitimate central ledger adapter
B. finance event-engine ledger adapter
C. legacy operational direct-posting path
D. reporting/read-only usage
E. test/fixture
```

Only A and B should remain capable of creating ledger transactions after
cutover.

## Maker-checker

Cutover requires independent approval.

The same person cannot both:

```text
request cutover
and
approve cutover
```

Treasury/payment cutovers should also receive explicit operational sign-off.

## Rollback

Rollback returns a domain to:

```text
shadow
```

It does not delete finance events or accounting records.

Never rewrite historical accounting data during rollback.

Rollback affects routing/authorization for new events only.

## Jobs

```js
const {
  startFinanceCrossDomainReconciliationJob,
} = require('./jobs/financeCrossDomainReconciliation.job');

const {
  startFinanceCutoverReadinessJob,
} = require('./jobs/financeCutoverReadiness.job');

const crossDomainReconciliationJob =
  startFinanceCrossDomainReconciliationJob({ logger });

const cutoverReadinessJob =
  startFinanceCutoverReadinessJob({ logger });
```

## Frontend routes

```jsx
<Route
  path="/admin/finance/cutover"
  element={<FinanceCutoverDashboard />}
/>

<Route
  path="/admin/finance/reconciliation"
  element={<CrossDomainReconciliationDashboard />}
/>
```

## Source-baseline constraint

The live Mzaya source ZIP was not available in this runtime.

Therefore this batch does not blindly remove any current direct-ledger calls.

That deletion must happen only after inspecting the actual working tree and
placing the legacy posting guard around every discovered mutation path.

This is deliberate: a finance cutover should never be performed against an
assumed codebase.

## Production cutover procedure

For each domain:

```text
1. deploy event integration
2. keep legacy mode
3. run production-like shadow traffic
4. run domain reconciliation
5. run cross-domain reconciliation
6. drain outbox backlog
7. clear dead letters
8. resolve reconciliation exceptions
9. request cutover
10. independent approval
11. activate block_legacy
12. monitor ledger/bank/reconciliation
13. rollback to shadow if material failure occurs
```

Do not cut over all domains in a single release.

## Post-cutover acceptance criteria

A domain is considered cut over only when:

```text
- new operational transactions publish finance outbox events
- event engine prepares accounting events
- ledger adapter posts them successfully
- reconciliation remains within threshold
- legacy direct-ledger writes are blocked
- legacy posting attempts are visible/audited
- no external money movement is duplicated
- no unresolved critical reconciliation exception exists
```

## Verification

```bash
cd backend

npm test -- cutoverReadiness.test.js
npm test -- cutoverMakerChecker.test.js
npm test -- legacyPostingGuard.test.js
npm test -- crossDomainReconciliation.test.js
npm test -- cutoverRollback.test.js

node --check src/services/financeDomainReconciliation.service.js
node --check src/services/financeCrossDomainReconciliation.service.js
node --check src/services/financeCutoverReadiness.service.js
node --check src/services/financeCutover.service.js
node --check src/services/financeLegacyPostingGuard.service.js

npm run lint
```

```bash
cd frontend

npm run lint
npm run build
```

## 08.5 completion

After this batch, the finance architecture is ready for a codebase-wide audit
and real merge pass.

The next work should not be another standalone finance feature.

The next work should be:

```text
Batch 08.6.1 — Live Codebase Finance Merge & Legacy Posting Audit
```

That batch should inspect the current repository, merge 08.5.1 through 08.5.8
into the actual operational services, remove duplicate scaffolding, place
guards around all remaining legacy ledger mutations, run the full test/build
suite, and produce the final finance migration manifest.
