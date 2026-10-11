# Mzaya Finance Release Runbook

## Purpose

This is the operational handoff for the finance, migration, test-isolation and
deployment hardening completed through Batch 08.6.6.

It is intentionally separate from Mzaya branding work. Branding has not started
in this release stream and must not be inferred from finance/backend terminology.

## Release baseline

Authoritative baseline:

`424e71d6c72fdde7dd6d933899a77c39a64da543`

Verified at closure:

| Gate | Result |
| --- | --- |
| Full Jest regression | 129/129 suites, 260/260 tests |
| Migration status | 50 total, 0 pending, 0 changed |
| Production dependency audit | 0 high/critical, 2 moderate |
| Staging boot | migrations only; no boot-time `sequelize.sync()` |
| Test DB | isolated disposable test database |
| Provider isolation in tests | mock mode + credentials blanked |

## Environment boundaries

### Development
Development may use developer-oriented schema behavior where explicitly configured.
Do not copy development schema boot behavior into staging or production.

### Test
Tests are destructive by design. `sequelize.sync({ force: true })` is permitted only
against a database whose actual database name contains `test` and while
`NODE_ENV=test`.

Use a dedicated `TEST_DB_URL`. Never point it at staging or production.

### Staging / production
Schema evolution is migration-owned. Application boot must not call
`sequelize.sync()` to mutate deployed schemas.

## Migration operating procedure

1. Inspect status:
   `node scripts/migrate.js status`
2. Reconcile/audit when adopting or investigating an existing schema:
   `node scripts/reconcile-migrations.js`
   `node scripts/audit-migration-schema.js`
3. Probe the exact candidate migration:
   `node scripts/probe-migration.js --file <filename>`
4. Review the probe output manually.
5. Only then execute the exact file with the explicit confirmation variable:
   `MIGRATION_EXECUTE_CONFIRM=I_HAVE_PROBED_THIS_MIGRATION`
   `node scripts/migrate.js migrate --file <filename>`
6. Clear the confirmation variable immediately after execution.
7. Rerun status and reconciliation.

Never use a blanket migration execution command. Never edit an already-applied
migration. Add a new repair/forward migration instead.

### Baselining

Baselining records migration history without executing SQL. It is an adoption tool,
not a shortcut.

Only baseline after verifying that the selected migration's effects already exist.
The runner requires:

`MIGRATION_BASELINE_CONFIRM=I_HAVE_VERIFIED_THE_SCHEMA`

Use `--file` or, only when deliberately verified, `--through`.

## Known reconciliation artifact

The reconciliation parser can report:

`20261011_staging_treasury_fx_rate_parity_repair.sql -> MISSING table if`

This is a parser artifact caused by procedural `IF` SQL, not evidence of a missing
table. Do not alter schema merely to make the parser report disappear.

## Finance safety invariants

1. Replay is accounting recovery, never a payment/provider execution mechanism.
2. Outbox retries must not trigger external money movement.
3. External transfer execution is an explicit operational action.
4. Creation/approval of a treasury transfer does not itself move money.
5. Internal bank-to-bank execution validates the canonical transfer contract.
6. Maker-checker controls remain required for treasury/cutover operations.
7. Rollback changes future routing; historical accounting is immutable.
8. Idempotency keys remain mandatory at provider/payment boundaries.
9. Failure recovery must preserve deterministic event/accounting behavior.

## Dependency security

Use a production-only audit before release:

`npm audit --omit=dev --audit-level=high`

The closure baseline had no high/critical findings. Two moderate findings remained
through the Sequelize -> uuid dependency chain.

Do not run `npm audit fix --force`; the previously proposed remediation introduced a
breaking Sequelize downgrade. Upgrade Sequelize/uuid only as a controlled dependency
change with the full regression gate.

## Release gate

From `backend/`:

1. `npm ci`
2. ensure `TEST_DB_URL` points to the disposable test database;
3. `npm test`
4. `npm audit --omit=dev --audit-level=high`
5. point `DB_URL` to the intended deployed environment only when running read-only
   migration status/reconciliation;
6. `npm run migrate:status`
7. `node scripts/reconcile-migrations.js`
8. review all output before deployment.

For a release with a new migration, add the probe/selective-execution procedure above.

## Incident rules

- Never paste database URLs, passwords, provider secrets or tokens into logs/issues.
- If a credential appears in logs, rotate it through the provider and update the
  deployment secret; do not commit the replacement.
- Do not repair finance incidents by rewriting historical ledger/accounting rows.
- Prefer additive corrective events/migrations with explicit audit trails.
- Treat ambiguous reconciliation output as manual-review evidence, not permission to
  mutate production.

## Handoff to product/branding work

Finance/deployment hardening is a platform foundation. It does not define the upcoming
Mzaya visual identity, typography, iconography, customer copy, Mzaya delivery-partner
presentation, or premium interface system.

When branding begins, preserve backend API contracts unless a deliberate migration is
approved. Product terminology changes such as user-facing `Mzaya` should be mapped at
the presentation/API boundary rather than casually renaming persistence contracts.
