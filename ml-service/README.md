# Mzaya — ML Service

FastAPI microservice providing anomaly detection, demand forecasting, performance scoring, and pricing optimisation for the Mzaya platform.

**It is deliberately independent.** If this service is down, deliveries keep working — the Node backend degrades gracefully rather than failing.

```bash
source venv/bin/activate          # .\venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

→ `http://localhost:8000` · interactive docs at `/docs`

---

## Structure

```
main.py                    FastAPI app + scheduler startup
app/
├── routes/                HTTP layer
│   ├── features.py        Feature extraction
│   ├── anomaly.py         Isolation Forest
│   ├── forecast.py        Prophet demand forecasting
│   ├── performance.py     Rider/vendor scoring
│   ├── optimization.py    Fees + surge pricing
│   └── analytics.py       Model metrics, spending trends
├── services/              The actual ML logic
├── db/
│   ├── database.py        PostgreSQL (shared with the backend)
│   ├── feature_store.py   Engineered features per order
│   └── redis_client.py    Feature cache
└── scheduler.py           APScheduler jobs
```

---

## Endpoints

```
POST   /features/extract          Extract features for one order
POST   /features/bulk-extract     Backfill features for all existing orders
GET    /features/{order_id}

POST   /anomaly/train             Train the Isolation Forest
POST   /anomaly/detect            Flag anomalies across recent orders
POST   /anomaly/score             Score a single order
GET    /anomaly/list              Flagged orders

POST   /forecast/train            Train Prophet per city/category
GET    /forecast/predict          Demand forecast
GET    /forecast/summary

GET    /performance/riders        A–F grades
GET    /performance/vendors
GET    /performance/summary

GET    /optimization/fees         Fee efficiency analysis
GET    /optimization/surge        Current surge level
GET    /optimization/report

GET    /analytics/model-metrics   Powers the admin "Mzaya AI" tab
GET    /analytics/spending-trends
GET    /analytics/city-breakdown
```

---

## How the models work

**Feature store.** Every order is reduced to engineered features (value, weight, distance, time-of-day, category, rider/vendor history) stored in PostgreSQL and cached in Redis. Everything downstream reads from here rather than recomputing.

**Anomaly detection.** Isolation Forest over the feature store — unsupervised, so it needs no labelled fraud. Flags orders that sit far from the normal distribution (unusual value for the distance, odd hour, atypical pattern for that customer). Retrains daily.

**Demand forecasting.** Prophet per city/category. With little history it falls back to a statistical forecast and **auto-upgrades** to Prophet once ~24h of data exists — so a new city doesn't produce nonsense predictions on day one.

**Performance scoring.** Riders and vendors graded A–F on completion rate, delivery time, acceptance speed, and cancellations.

**Surge pricing.** Four levels (low / normal / high / peak) derived from live demand-vs-supply.

---

## Scheduler

APScheduler (started in `main.py`):

| Job | Frequency |
|---|---|
| Feature extraction | every 30 min |
| Anomaly detection | hourly |
| Model retraining | daily, 02:00 CAT |

---

## Environment

**ml-service/.env**
```
DB_URL=postgresql://postgres:password@localhost:5432/mzaya
REDIS_URL=redis://localhost:6379
ML_SERVICE_PORT=8000
NODE_BACKEND_URL=http://localhost:5000
```

The database is **shared with the Node backend** — this service reads orders directly and writes its own feature/anomaly tables.

---

## First run

```bash
# Backfill features from existing orders, then train:
curl -X POST http://localhost:8000/features/bulk-extract
curl -X POST http://localhost:8000/anomaly/train
```

Without a backfill the models have nothing to learn from, and the admin **Mzaya AI** tab will show empty metrics.
