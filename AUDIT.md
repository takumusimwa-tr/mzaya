# Mzaya — Pre-Deployment Audit

**Repo:** `github.com/takumusimwa-tr/mzaya` · **Audited:** full clone of `main`
**Verdict:** architecture is sound. There are **3 bugs that will bite you in production** and a handful of cleanups. Nothing structural needs rewriting.

---

## ✅ What's already right

These are the things people usually get wrong. You didn't:

- **No secrets in git.** `.env` files are gitignored and never entered history. Verified across all commits.
- **No insecure JWT fallback.** `process.env.JWT_SECRET` has no default — the app fails rather than signing tokens with a guessable secret. This is the correct choice.
- **DB fails fast.** Missing `DB_URL` exits at boot instead of running half-broken.
- **Repo is lean.** 737KB, no `node_modules` committed.
- **Route ordering is correct.** `negotiationRoutes` and `chatRoutes` mount *before* `orderRoutes`, so `/negotiable` and `/:id/messages` resolve before the catch-all `GET /:id`. Easy to get wrong; you got it right.
- **Env vars used properly.** `localhost` only ever appears as a *fallback*, never hardcoded.
- **Clean layering.** routes → controllers → services → models. Consistent across 18 route files. No business logic leaking into routes.

---

## 🔴 CRITICAL — fix before deploying

### 1. Race condition: two riders can claim the same order
**`backend/src/controllers/order.controller.js` → `claimOrder`** (also `chooseOffer` in `negotiation.controller.js`)

```js
const order = await Order.findByPk(req.params.id);
if (order.rider_id) return res.status(409)...   // ← check
await order.update({ rider_id: req.user.id });  // ← act
```

This is **check-then-act**. Two riders tapping "Accept" within the same few milliseconds both read `rider_id = null`, both pass the check, and both write. One silently overwrites the other. With multiple active riders this *will* happen — and the losing rider drives to a pickup that isn't theirs.

**Fix:** atomic conditional update — write only where `rider_id IS NULL`, then check rows affected.

### 2. `sequelize.sync({ alter: true })` runs on every boot
**`backend/src/index.js:89`**

Fine in dev (it's what's been auto-creating your tables). **Dangerous in production:**
- It inspects and *mutates* live schema on every restart.
- On a table with real data it can lock, hang, or drop columns it thinks are stale.
- A deploy that restarts the app becomes a schema migration you didn't intend.

**Fix:** guard it — `alter` only outside production; production uses explicit migrations.

### 3. No SSL in the database connection
**`backend/src/config/db.js`**

Render, Railway, Supabase, Heroku, Neon — essentially every managed Postgres — **require SSL**. The current config has no `dialectOptions.ssl`, so the connection will be **refused on deploy**.

**Fix:** enable SSL when a production DB URL is used.

---

## 🟡 SHOULD FIX — real issues, not urgent

### 4. Dead file: `frontend/src/api.js`
An 85-line duplicate of `src/api/api.js`. **Zero imports** point to it (all 33 use `api/api.js`). Leftover from a refactor. Delete it — a stale duplicate API client is exactly the kind of thing someone "fixes a bug in" six months from now and wonders why nothing changed.

### 5. Uploaded images committed to the repo
`backend/uploads/*.jpeg` (3 files) are versioned. They shouldn't be — uploads are runtime data, not source. Add `backend/uploads/` to `.gitignore`. (Cloudinary makes this moot in prod, but the repo shouldn't carry them.)

### 6. Two env vars for the same backend
- `frontend/src/realtime/socket.js` → `VITE_API_ORIGIN`
- everything else → `VITE_API_URL`

Two names for one thing = one of them gets forgotten in the production env config, and the socket silently fails to connect while the rest of the app works. **Consolidate to one.**

### 7. `.gitignore` missing `frontend/node_modules/`
It has `backend/node_modules/` but not the frontend's. It hasn't bitten you (frontend has its own `.gitignore`), but it's an inconsistency worth closing.

### 8. Empty `Dockerfile` (0 bytes)
Either write it or delete it. An empty Dockerfile in the root will confuse any deploy platform that auto-detects it.

### 9. Stale `README.md`
Still documents **ContiPay** as the payment gateway (3 places). You've since replaced it with Paynow. The README is the first thing a collaborator — or future you — reads.

### 10. Leftover dev script
`sweep-green.ps1` at repo root. It served its purpose during the branding pass. Delete or move to a `scripts/` folder.

---

## 🟢 Structure — assessment

**GitHub structure: good.** Three clear services (`backend/`, `frontend/`, `ml-service/`), sensible internal layering, no god-files.

**No significant code duplication found** beyond the dead `api.js`. The `resolveVendorId` / `resolveCityId` helpers appear once and are reused. Controllers don't repeat business logic.

**One structural observation, not a problem yet:** `backend/src/index.js` mounts 18 route files and is doing a lot (dotenv, middleware, static serving, sockets, jobs, sync, error handling, boot). It's still readable, but it's the file most likely to become a mess. Worth splitting `app.js` (express setup) from `server.js` (boot) *eventually* — not now.

**ML service is genuinely wired in** (called from `analytics.controller.js` and `order.service.js`), not dead weight.

---

## Deployment checklist (from this audit)

Env vars production will need:

**Backend**
```
DB_URL=                      (with SSL)
JWT_SECRET=                  (long random — no fallback exists, so this MUST be set)
PORT=                        (usually injected by host)
CLIENT_ORIGINS=              (your frontend domain — for CORS + socket)
APP_URL=                     (backend public URL — Paynow webhooks)
CLIENT_URL=                  (frontend public URL — Paynow returns)
ML_SERVICE_URL=
PAYNOW_INTEGRATION_ID=       (when merchant account is live)
PAYNOW_INTEGRATION_KEY=
CLOUDINARY_CLOUD_NAME=       (walkthrough pending)
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Frontend**
```
VITE_API_URL=                (consolidate — see issue #6)
```

Also note: **`app.use(cors())` allows all origins.** Fine for now; lock it to your domain in production.
