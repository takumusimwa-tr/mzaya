# Mzaya — Backend

Node + Express + PostgreSQL (Sequelize) + Socket.IO. Serves the PWA, runs dispatch, payments, and real-time.

```bash
npm install
npm run dev        # → http://localhost:5000
```

Requires PostgreSQL 18 and Redis running locally.

---

## Structure

```
src/
├── index.js              Boot: middleware, route mounting, sockets, jobs, sync
├── config/
│   ├── db.js             Sequelize connection (SSL in production)
│   └── constants.js      Roles, order statuses, payment methods, vehicle tiers
├── models/               Sequelize models + associations.js (the wiring)
├── routes/               Thin — auth guards + delegation, no logic
├── controllers/          Request/response handling
├── services/             Business logic (dispatch, orders, payments, currency, ML)
├── realtime/socket.js    Socket.IO server: auth, rooms, emit helpers
├── jobs/                 Cron: currency sync, scheduled-order release
├── middleware/           JWT auth + role guards
└── utils/                Fee calculator, promo evaluation, pin parsing, hours
```

**Layering is strict:** routes → controllers → services → models. Business logic belongs in services; controllers translate HTTP.

---

## Key concepts

### Brands and branches
A **brand** (Chicken Inn) has many **branches** (vendors). Customers browse brands; the system silently resolves the nearest branch. Menus belong to the branch, not the brand. A single-location vendor is simply a brand with one branch.

### Polymorphic orders
One `orders` table plus a per-category detail table (`order_food`, `order_grocery`, `order_materials`, `order_errand`). `resolveVendorId()` in `order.service.js` walks the detail tables to find which vendor owns an order.

### Dispatch
Vehicle tier is assigned by weight (bike < 20kg, bakkie ≤ 500kg, truck above). Riders can only claim orders their registered vehicle can carry — enforced **server-side**, since a stale board or a crafted request shouldn't let a bike take a truckload.

Claiming is an **atomic conditional update**:

```js
const [updated] = await Order.update(
  { rider_id: req.user.id, status: 'accepted' },
  { where: { id, rider_id: null, status: 'pending' } },
);
if (updated === 0) return res.status(409).json({ error: 'Already taken' });
```

Check-then-act would let two riders claim the same order in a race. The `WHERE rider_id IS NULL` guard makes the database decide the winner.

### Fare negotiation (materials + errands)
The customer posts a fare (`is_negotiable`, `offered_fare_usd`) and auto-dispatch is **deferred**. Riders accept or counter into `order_offers`. The customer picks one; that rider is assigned and the agreed fare becomes the delivery fee. Food and grocery stay fixed-price.

### Real-time
Socket.IO shares the HTTP server. Clients authenticate with their JWT on handshake and join rooms:

| Room | Who |
|---|---|
| `user:{id}` | that person |
| `vendor:{id}` | a branch's console |
| `city:{id}` | riders in a city |
| `admins` | the live monitor |

Services call the emit helpers in `realtime/socket.js` (`emitOrderNew`, `emitOrderUpdated`, `emitOrderAssigned`). Screens refetch on the event — real-time triggers the existing queries rather than replacing them.

### Payments (Paynow)
- **Mobile money** (EcoCash/OneMoney/InnBucks) → Express Checkout: USSD push, then poll `pollUrl`.
- **Card / diaspora** → hosted redirect; Paynow calls the webhook and returns the browser.
- Requests and webhooks are SHA512 hash-signed.

**Mock mode:** if `PAYNOW_INTEGRATION_ID` / `PAYNOW_INTEGRATION_KEY` are absent, the whole flow is simulated (mobile auto-confirms after ~5s). Add the credentials to go live — no code change.

### Uploads
Cloudinary when configured (CDN + automatic optimisation), local disk otherwise. Response shape is `{ url }` either way, so nothing downstream cares. Uploaded files are **not** committed — `backend/uploads/` is gitignored.

---

## Environment

```
PORT=5000
NODE_ENV=development
DB_URL=postgresql://postgres:password@localhost:5432/mzaya
JWT_SECRET=<32+ random chars>       # no fallback — the app will not start without it
ML_SERVICE_URL=http://localhost:8000
ZIG_RATE=27.50

APP_URL=http://localhost:5000        # public backend URL (Paynow webhooks)
CLIENT_URL=http://localhost:5173     # public frontend URL (Paynow returns)
CLIENT_ORIGINS=http://localhost:5173 # CORS + socket allowlist (comma-separated)

PAYNOW_INTEGRATION_ID=               # omit → mock payments
PAYNOW_INTEGRATION_KEY=

CLOUDINARY_CLOUD_NAME=               # omit → local disk uploads
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

DB_SSL=                              # force SSL outside production if needed
```

---

## Production behaviour

Set `NODE_ENV=production` and three things change deliberately:

1. **`sync({ alter })` is disabled.** In development the schema auto-updates as models change. In production that would mutate live schema on every restart — a redeploy would silently become a migration. Production schema changes go through explicit migrations.
2. **SSL is required** on the database connection (managed Postgres providers demand it).
3. **CORS is locked** to `CLIENT_ORIGINS` instead of allowing every origin.

---

## Conventions

- New models are picked up automatically in development — `sync({ alter: true })` creates tables and adds columns on boot. No migration needed for additive changes *in dev*.
- Register every model in `models/associations.js` — it's the single place relationships are wired, and it's what `index.js` imports.
- Route files stay thin. If a route file contains an `if`, it probably belongs in a controller.
- Never trust client-supplied money. Promos, fees, and fares are all re-evaluated server-side.
