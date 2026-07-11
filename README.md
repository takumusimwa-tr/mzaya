# Mzaya

> Zimbabwe's on-demand logistics platform — food, groceries, building materials, and errands in one app.

Mzaya is a full-stack delivery platform built for the Zimbabwean market. One role-based PWA serves customers, riders, vendors, and admins; a Node backend runs operations in real time; a Python microservice handles the machine learning.

---

## What makes Mzaya different

Most delivery platforms assume stable currency, reliable cards, and cheap data. Zimbabwe has none of those. Every significant design decision here follows from that:

- **Mobile money first** — EcoCash, OneMoney, InnBucks via Paynow. USSD push, no card needed.
- **Dual currency** — prices stored in USD, ZiG shown alongside at the live rate.
- **Data is expensive, so we don't waste it** — images are served as CDN thumbnails sized to their display slot (a 4MB photo reaches a phone as a ~20KB WebP); navigation deep-links to the rider's existing Google Maps rather than streaming map tiles; calling uses the device dialer, not VoIP.
- **Fare negotiation** — for materials and errands, customers name a price and riders accept or counter (inDrive model). Food and grocery stay fixed-price.
- **Multi-category, one platform** — a sadza order and a truck of cement run through the same dispatch engine.
- **Weight-aware dispatch** — bike / bakkie / truck assigned automatically from order weight.

---

## Structure

```
mzaya/
├── frontend/     React PWA (customer · rider · vendor · admin)
├── backend/      Node + Express + PostgreSQL + Sequelize + Socket.IO
└── ml-service/   Python + FastAPI + scikit-learn + Prophet
```

The ML service is independent. If it goes down, deliveries keep running.

---

## What's built

### Frontend — one app, four roles
A single React PWA that adapts to the logged-in role.

- **Customer** — browse brands (nearest branch resolved silently) or products, cart, checkout, scheduling, promos, live order tracking, in-app chat, ratings, favourites, saved addresses.
- **Rider** — job board, claim orders, name-your-fare bargaining, turn-by-turn navigation (Google Maps deep-link), delivery proof photo, earnings.
- **Vendor** — tablet-optimised console: live order queue, menu management, opening hours, branch switching, analytics.
- **Admin** — approvals (vendor/rider), live order monitor, promo CRUD, and **Mzaya AI** (ML insights).

### Backend
- **Auth** — JWT, four roles: customer, rider, vendor, admin.
- **Brands → branches** — a brand (e.g. Chicken Inn) has many branches; the customer sees the brand, the system resolves the nearest branch. Menus live on the branch.
- **Orders** — polymorphic across food, grocery, materials, errands.
- **Dispatch** — vehicle assignment by weight, rider matching, haversine distance, fee calculation with surcharges.
- **Fare negotiation** — offers/counters on an `order_offers` table; customer picks the winner; the agreed fare becomes the delivery fee.
- **Real-time (Socket.IO)** — JWT-authenticated sockets, room-based (`user:` / `vendor:` / `city:` / `admins`). Order events push live to every role. Polling remains only as a slow fallback.
- **Chat** — one shared thread per order across customer, rider, and vendor, plus click-to-call via the device dialer.
- **Payments (Paynow)** — Express Checkout (USSD push + poll) for mobile money; hosted redirect for cards and diaspora. Runs in **mock mode** until merchant credentials are set.
- **Uploads** — Cloudinary in production (auto-optimised, CDN), local disk in dev. Same `{ url }` response either way.

### ML service
- **Feature store** — engineered features per order into PostgreSQL, cached in Redis.
- **Anomaly detection** — Isolation Forest flags suspicious orders; retrains daily.
- **Demand forecasting** — Prophet per city/category, with a statistical fallback until enough history exists.
- **Performance scoring** — riders and vendors graded A–F.
- **Spend optimisation** — fee efficiency and a 4-level surge engine.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · Vite · Tailwind · TanStack Query · Zustand · PWA |
| Real-time | Socket.IO |
| Backend | Node.js · Express · Sequelize · PostgreSQL 18 |
| Auth | JWT + bcrypt, role guards |
| Payments | Paynow (EcoCash · OneMoney · InnBucks · card · diaspora) |
| Images | Cloudinary (CDN + on-the-fly optimisation) |
| ML | Python · FastAPI · scikit-learn · Prophet · Redis |
| Security | helmet, CORS allowlist, hashed webhooks |

---

## Running locally

**Prerequisites:** Node.js 18+, PostgreSQL 18, Redis, Python 3.11+ (for the ML service)

```bash
# Backend  → http://localhost:5000
cd backend && npm install && npm run dev

# Frontend → http://localhost:5173
cd frontend && npm install && npm run dev

# ML service → http://localhost:8000  (docs at /docs)
cd ml-service
source venv/bin/activate        # .\venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Schema is created automatically on backend boot (`sync({ alter: true })` in development only — see *Production notes*).

**First-time setup**
```bash
# 1. Register a user, then promote them:
#    UPDATE users SET role = 'admin' WHERE phone = '...';
# 2. Seed cities:            POST /api/cities/seed   (admin token)
# 3. Backfill ML features:   POST /features/bulk-extract
# 4. Train anomaly model:    POST /anomaly/train
```

---

## Environment variables

**backend/.env**
```
PORT=5000
NODE_ENV=development
DB_URL=postgresql://postgres:password@localhost:5432/mzaya
JWT_SECRET=<32+ random chars — no fallback exists, this MUST be set>
ML_SERVICE_URL=http://localhost:8000
ZIG_RATE=27.50

# Public URLs (Paynow webhooks + returns)
APP_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
CLIENT_ORIGINS=http://localhost:5173      # CORS + socket allowlist

# Paynow — omit to run payments in MOCK mode
PAYNOW_INTEGRATION_ID=
PAYNOW_INTEGRATION_KEY=

# Cloudinary — omit to store uploads on local disk (dev only)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

**ml-service/.env**
```
DB_URL=postgresql://postgres:password@localhost:5432/mzaya
REDIS_URL=redis://localhost:6379
ML_SERVICE_PORT=8000
NODE_BACKEND_URL=http://localhost:5000
```

---

## Production notes

Behaviour deliberately differs in production (`NODE_ENV=production`):

- **Schema is not auto-altered.** `sync({ alter: true })` runs in development only. In production it would mutate live schema on every restart — a redeploy would become an unintended migration. Production schema changes go through explicit migrations.
- **Database uses SSL.** Managed Postgres (Render, Railway, Supabase, Neon) requires it.
- **CORS is locked** to `CLIENT_ORIGINS`. In development it's open.
- **Payments and uploads go live** the moment their credentials are present — no code change. Absent credentials, both fall back safely (mock payments, local uploads).

---

## Roadmap

- [ ] Deployment + Capacitor wrap (`zw.co.mzaya`)
- [ ] PostGIS migration (haversine is fine at current scale)
- [ ] Paynow merchant account (currently mock mode)
- [ ] Number masking for in-app calls
- [ ] Offer expiry on fare negotiation
- [ ] Favicon / PWA icon export from the brand SVG

---

*Mzaya — Tumai Mzaya.*