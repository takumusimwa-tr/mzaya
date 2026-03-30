from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.database import get_db
from app.db.redis_client import get_redis
import json

router = APIRouter()

# ─── GET /analytics/model-metrics ────────────────────────────────────────────
@router.get("/model-metrics")
async def model_metrics(db: AsyncSession = Depends(get_db)):
    # Total orders with features
    total = await db.execute(text("SELECT COUNT(*) FROM order_features"))
    total_payments = total.scalar() or 0

    # Anomaly stats
    anomaly = await db.execute(
        text("SELECT COUNT(*) FROM order_features WHERE is_anomaly = 1")
    )
    anomaly_count = anomaly.scalar() or 0
    anomaly_rate  = round(anomaly_count / total_payments, 4) if total_payments > 0 else 0

    # Average std dev of total_usd
    std = await db.execute(
        text("SELECT STDDEV(total_usd) FROM order_features")
    )
    avg_std_dev = round(float(std.scalar() or 0), 4)

    # Last trained
    trained = await db.execute(
        text("""
            SELECT last_trained_at, model_name, model_version
            FROM model_metrics
            ORDER BY created_at DESC
            LIMIT 1
        """)
    )
    last = trained.fetchone()

    return {
        "totalPayments":  total_payments,
        "anomalyRate":    anomaly_rate,
        "anomalyCount":   anomaly_count,
        "avgStdDev":      avg_std_dev,
        "lastTrainedAt":  last.last_trained_at.isoformat() if last and last.last_trained_at else None,
        "modelName":      last.model_name if last else None,
        "modelVersion":   last.model_version if last else None,
    }

# ─── GET /analytics/spending-trends ──────────────────────────────────────────
@router.get("/spending-trends")
async def spending_trends(
    city: str = None,
    db: AsyncSession = Depends(get_db)
):
    where = "WHERE city = :city" if city else ""
    params = {"city": city} if city else {}

    result = await db.execute(
        text(f"""
            SELECT
                DATE_TRUNC('day', created_at) as day,
                category_type,
                COUNT(*) as order_count,
                SUM(total_usd) as total_spend,
                AVG(total_usd) as avg_order_value
            FROM order_features
            {where}
            GROUP BY day, category_type
            ORDER BY day DESC
            LIMIT 90
        """),
        params
    )
    rows = result.fetchall()
    return {
        "trends": [
            {
                "day":             r.day.isoformat(),
                "category_type":   r.category_type,
                "order_count":     r.order_count,
                "total_spend_usd": round(float(r.total_spend or 0), 2),
                "avg_order_usd":   round(float(r.avg_order_value or 0), 2),
            }
            for r in rows
        ]
    }

# ─── GET /analytics/city-breakdown ───────────────────────────────────────────
@router.get("/city-breakdown")
async def city_breakdown(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
            SELECT city,
                   COUNT(*) as order_count,
                   SUM(total_usd) as total_spend,
                   AVG(delivery_minutes) as avg_delivery_minutes
            FROM order_features
            GROUP BY city
            ORDER BY order_count DESC
        """)
    )
    rows = result.fetchall()
    return {
        "cities": [
            {
                "city":                  r.city,
                "order_count":           r.order_count,
                "total_spend_usd":       round(float(r.total_spend or 0), 2),
                "avg_delivery_minutes":  round(float(r.avg_delivery_minutes or 0), 1),
            }
            for r in rows
        ]
    }