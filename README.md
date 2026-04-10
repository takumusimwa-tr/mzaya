# Mzaya

> Zimbabwe's on-demand logistics and procurement intelligence platform.

Mzaya is a full-stack delivery platform built for the Zimbabwean market — combining food delivery, grocery, building materials, and errand services into a single app, powered by a machine learning engine that detects anomalies, forecasts demand, scores performance, and optimizes pricing in real time.

---

## What makes Mzaya different

Most delivery platforms are built for markets with stable currencies, reliable card infrastructure, and high internet penetration. Zimbabwe has none of those. Mzaya is built from the ground up for:

- **Mobile money first** — EcoCash, OneMoney, InnBucks, and ZIPIT via ContiPay. No card required.
- **Dual currency** — all prices stored in USD, displayed in ZiG at the live RBZ rate
- **Low bandwidth** — PWA frontend with aggressive caching, WebP images under 50KB
- **Multi-category** — food, groceries, building materials, and errands in one platform
- **Intelligent dispatch** — automatic vehicle assignment based on order weight (bike / bakkie / truck)

---

## Platform overview

```
mzaya/
├── backend/        Node.js + Express + PostgreSQL + Sequelize
└── ml-service/     Python + FastAPI + scikit-learn + Prophet
```

The backend handles all delivery operations. The ML service runs alongside it as an independent microservice — if it goes down, deliveries keep working.

---

## Backend — what's built

**Auth** — JWT-based authentication with four roles: customer, rider, vendor, admin

**Orders** — polymorphic order system supporting four categories:
- Food (restaurants)
- Grocery (supermarkets)
- Materials (hardware suppliers — bikes for <20kg, bakkies up to 500kg, trucks above)
- Errands (queuing, form submissions, document delivery)

**Dispatch** — automatic vehicle assignment, rider matching, Haversine distance calculation, fee calculation with weight surcharges

**Payments** — ContiPay gateway integration covering all Zimbabwe digital payment methods. USSD push for mobile money, redirect flow for card and ZIPIT

**Vendors** — full menu management, opening hours, location, approval workflow

**Riders** — profile registration, GPS location updates, online/offline toggle, city scoping

**Cities** — multi-city support with GPS bounds for zone validation (Harare, Bulawayo, Mutare at launch)

**Currency** — daily ZiG/USD sync job, rate snapshot stored on every order

---

## ML service — what's built

**Feature store** — every order automatically extracts 12 engineered features into PostgreSQL + Redis cache

**Anomaly detection** — Isolation Forest model flags suspicious transactions in real time. Scheduled retraining daily at 02:00 CAT

**Demand forecasting** — Prophet time-series model per city/category. Falls back to statistical forecast until 24+ hours of data accumulates, then auto-upgrades

**Performance scoring** — riders and vendors scored A–F on completion rate, delivery time, acceptance speed, and cancellation rate

**Spend optimization** — fee efficiency analysis, surge pricing engine (4 levels: low / normal / high / peak), revenue optimization report

**Scheduler** — APScheduler runs feature extraction every 30 mins, anomaly detection hourly, model retraining daily

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js 24 + Express |
| ORM | Sequelize + PostgreSQL 18 |
| Auth | JWT (jsonwebtoken) |
| ML runtime | Python 3.14 + FastAPI |
| ML models | scikit-learn (Isolation Forest), Prophet |
| Feature store | PostgreSQL + Redis |
| Scheduler | APScheduler (Python), node-cron (Node) |
| Payments | ContiPay (EcoCash, OneMoney, InnBucks, ZIPIT, Visa, Mastercard) |
| Security | helmet, bcrypt, JWT role guards |

---

## API

Full documentation: see `Mzaya_API_Documentation.docx`

**Backend** runs on `http://localhost:5000`

**ML service** runs on `http://localhost:8000` with Swagger UI at `http://localhost:8000/docs`

Quick reference:

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/orders
GET    /api/orders/my
GET    /api/vendors
GET    /api/cities
POST   /api/payments/:id/pay

GET    /analytics/model-metrics
POST   /anomaly/train
GET    /forecast/predict
GET    /performance/riders
GET    /optimization/report
```

---

## Running locally

**Prerequisites:** Node.js 18+, Python 3.11+, PostgreSQL 18, Redis

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**ML service:**
```bash
cd ml-service
.\venv\Scripts\Activate.ps1      # Windows
source venv/bin/activate          # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**First-time setup:**
```bash
# 1. Register admin user via POST /api/auth/register
# 2. Manually set role: UPDATE users SET role = 'admin' WHERE phone = '...'
# 3. Seed cities: POST /api/cities/seed (admin token required)
# 4. Backfill ML features: POST /features/bulk-extract
# 5. Train anomaly model: POST /anomaly/train
```

---

## Environment variables

**backend/.env**
```
PORT=5000
DB_URL=postgresql://postgres:password@localhost:5432/mzaya
JWT_SECRET=<min 32 chars>
NODE_ENV=development
APP_URL=http://localhost:5000
ZIG_RATE=27.50
ML_SERVICE_URL=http://localhost:8000
CONTIPAY_API_KEY=<from contipay.co.zw>
CONTIPAY_MERCHANT_CODE=<from contipay.co.zw>
```

**ml-service/.env**
```
DB_URL=postgresql://postgres:password@localhost:5432/mzaya
REDIS_URL=redis://localhost:6379
ML_SERVICE_PORT=8000
NODE_BACKEND_URL=http://localhost:5000
```

---

## Before going live

- [ ] ContiPay merchant account and sandbox testing
- [ ] Automated RBZ rate feed (replace manual ZIG_RATE)
- [ ] Integration tests for payment flow and fee calculator
- [ ] WebSocket real-time order tracking
- [ ] Frontend PWA (customer, vendor dashboard, rider app, admin panel)

---

## Built with

Inspired by DoorDash's business model, adapted for Zimbabwe's economic reality — mobile money, dual currency, variable connectivity, and the need for a platform that handles everything from a sadza order to a truck full of cement.

---

*Mzaya — Built for Zimbabwe*
