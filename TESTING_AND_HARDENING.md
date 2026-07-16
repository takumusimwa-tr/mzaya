# Mzaya — Production Hardening & Test Suite

Status of the pre-deployment hardening effort, the integration test suite, and the
external credentials still required before going live.

**Last updated:** July 2026
**Test status:** 25 passed / 25 total, 3 suites green

---

## 1. Test suite

Integration tests run against a **real PostgreSQL 18** — not a mocked database.
Every bug these tests exist to catch lives at the database boundary (atomic
updates, unique constraints, type checking), so a mock would pass while production
broke.

```
backend/tests/
  env.js            environment bootstrap — runs FIRST via Jest setupFiles
  setup.js          factories + lifecycle (resetDatabase, makeCity, makeUser, …)
  teardown.js       closes the shared DB connection once, after all files
  auth.test.js      authentication + authorization
  orders.test.js    order lifecycle + the claim race
  payments.test.js  payment integrity
```

### Running the tests

```bash
cd backend
npm install --save-dev jest supertest      # first time only
npm test                                    # full suite
npm run test:watch                          # re-run on change
npm run test:coverage                       # with coverage
```

Requires a test database (created once):

```bash
createdb mzaya_test
```

and `TEST_DB_URL` in `backend/.env`:

```
TEST_DB_URL=postgresql://postgres:<password>@localhost:5432/mzaya_test
```

If `TEST_DB_URL` is absent, the suite derives one from `DB_URL` by appending
`_test`, and refuses to run against any database whose name doesn't contain
"test" — a guard against ever dropping the development database.

### What each test proves

**auth.test.js**
| Test | Guards against |
|---|---|
| registers a customer and returns a token | broken signup; password leaking in the response |
| rejects a duplicate phone number | duplicate accounts |
| rejects a wrong password | auth bypass |
| refuses an unauthenticated request | missing auth on protected routes |
| refuses a forged token | JWT forgery |
| vendor cannot read another vendor's order | **the vendor read-hole data leak** |
| customer cannot read another customer's order | cross-account order access |
| owning customer CAN read their own order | over-restrictive auth |
| customer cannot reach admin endpoints | privilege escalation |
| chat contacts hidden from unrelated users | **phone-number harvesting via /contacts** |

**orders.test.js**
| Test | Guards against |
|---|---|
| exactly ONE of two concurrent claims wins | **the claim race condition** (two Mzayas, one order) |
| refuses a second claim on a claimed order | double assignment |
| refuses a Mzaya whose vehicle is too small | a bike being sent for a tonne of cement |
| refuses an unapproved Mzaya | unvetted riders taking work |
| only the assigned Mzaya can update status | strangers moving someone else's delivery |
| delivery requires a proof photo | unverified "delivered" marks |

**payments.test.js**
| Test | Guards against |
|---|---|
| one idempotency key → one attempt | double USSD prompts / double charges |
| survives two concurrent pay requests | the same, under a race |
| prompt goes to the entered number | **the ignored-phone bug** |
| normalises +263 to local format | rejected valid numbers |
| rejects a non-Zimbabwean mobile | malformed payment numbers |
| a failed payment does NOT cancel the order | **orders destroyed by a transient gateway blip** |
| never regresses a settled payment | **a late "failed" webhook un-paying a paid order** |
| duplicate webhook applied exactly once | repeated side effects from gateway retries |
| cannot pay for someone else's order | payment on another user's order |

---

## 2. CI

`.github/workflows/ci.yml` runs on every push and pull request:

- **Backend tests** against a real Postgres 18 service container
- **Migrations apply cleanly to an empty database** — proof that a migration works
  from nothing, not just against a developer's laptop
- **Frontend build** + a bundle-size warning above 3 MB (mobile data is expensive
  in the target market)
- **Dependency audit** — fails on HIGH/CRITICAL only (see SECURITY_NOTES.md for the
  two accepted moderates)

---

## 3. Hardening completed

Every P0/P1 from the security review is done. The ones marked ✅-tested are locked
behind a passing integration test.

### Payments
- ✅-tested — **Idempotency**: append-only `payment_attempts`, unique idempotency
  key; a double-tap produces one attempt.
- ✅-tested — **Monotonicity**: an order's paid state is derived from attempts; a
  late or duplicate event can't drag a settled payment backwards.
- ✅-tested — **Webhook dedup**: unique `(reference, payload_hash)` on
  `payment_events`; a retried webhook applies once.
- ✅-tested — **Correct phone**: the customer's entered number is used, with
  Zimbabwe normalisation (+263 / 07x, Econet / NetOne / Telecel prefixes).
- ✅-tested — **No order cancellation** on payment failure.
- **Mock payments gated**: require an explicit `ALLOW_MOCK_PAYMENTS=true`,
  hard-refused in production. `validateEnv` won't boot production without real
  Paynow credentials.

### Authorization & data leaks
- ✅-tested — **Vendor read-hole closed**: a vendor could previously read ANY
  order in the system (competitor customer data) by changing a UUID. Now guarded
  at the route and service layers.
- ✅-tested — **Chat contacts guarded**: `/contacts` returns phone numbers and had
  no ownership check; strangers could harvest numbers. Now guarded.
- **Centralised ownership middleware** (`loadOrder`, `ownsBranch`, `activeRider`)
  replaced 13 hand-rolled, drifted checks.
- **Socket rooms authorized**: `join:vendor` / `join:city` are DB-checked;
  previously any client could join any room and receive its live feed.

### Concurrency
- ✅-tested — **Claim race**: atomic conditional update means exactly one Mzaya
  wins a contested order.

### Infrastructure
- **Service worker rebuilt**: no longer caches private API responses or persists
  the auth token; purges all caches on logout. (Fixes a token-leak and a
  cross-account cache leak on shared phones.)
- **CORS fails closed**: refuses to boot in production without an allowlist
  (previously fell through to allowing every origin).
- **Rate limiting**: Redis-backed, shared across instances, with graceful
  in-memory fallback.
- **Request tracing**: every request carries an id, echoed in responses and on
  every log line.
- **Structured logging**: 80 `console.error` calls became searchable JSON events
  with request/user context.
- **Migration runner**: ordered, checksummed, transactional `.sql` migrations with
  `status` / `baseline` commands. Production runs migrations, never `sync()`.
- **Dependency vulnerabilities**: frontend at 0; backend cleared of all
  payment-path vulns (axios auth-bypass, follow-redirects header leak, form-data
  CRLF). Two accepted moderates documented in SECURITY_NOTES.md.

---

## 4. Awaiting real credentials ⚠️

Everything on the correctness list is done. The remaining items are **not code
fixes** — they are external accounts and secrets that must be supplied before or
during deployment. The application is built to use them; it just needs the values.

### 🔑 Paynow (payment gateway) — REQUIRED
- `PAYNOW_INTEGRATION_ID`
- `PAYNOW_INTEGRATION_KEY`

Production **will not boot** without these (by design). Until they're set, payments
run in simulated mock mode, which is forbidden in production. ContiPay is the
pending gateway relationship; the Paynow integration is the current implementation.

### 🔑 Cloudinary (image hosting) — REQUIRED
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Without these, uploads (vendor logos, delivery-proof photos) fall back to the
container's local disk, which is **wiped on every redeploy**. Production refuses to
boot without them. Free tier is sufficient to start.

### 🔑 Redis (rate limiting + ML cache) — RECOMMENDED
- `REDIS_URL`

Without it, rate limits are per-instance and reset on each deploy. Fine for a
single instance; needed once you scale horizontally. The ML service also uses
Redis.

### 🔧 Deployment environment — REQUIRED at deploy time
- `DB_URL` — production PostgreSQL connection string
- `JWT_SECRET` — at least 32 random characters
- `CLIENT_ORIGINS` — comma-separated allowlist of frontend origins (production
  refuses to boot without it; CORS fails closed)
- `APP_URL`, `CLIENT_URL` — public URLs for payment callbacks and redirects
- `NODE_ENV=production`

### 📋 Deployment steps (once credentials are in hand)
1. Provision PostgreSQL and Redis on the host (Render / Railway).
2. Set all environment variables above.
3. Run `npm run migrate` against the fresh production database (do **not**
   baseline — baseline is only for an already-migrated database).
4. Deploy backend, frontend, and the ML service.
5. Verify `/health` and `/ready`.
6. (Optional) Capacitor wrap for the Android app (`zw.co.mzaya`).

---

## 5. Known cosmetic item

`npm test` prints `Force exiting Jest` at the end. A background handle (the Redis
client or the DB pool) stays open after tests finish. Tests pass and the process
exits cleanly; this is a tidiness note, not a failure. Can be resolved later by
closing the rate-limiter's Redis client in teardown.
