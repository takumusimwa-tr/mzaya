import pandas as pd
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.redis_client import get_redis
from app.db.feature_store import OrderFeature
import json

# ─── Extract features from a single order ────────────────────────────────────
def extract_features(order: dict) -> dict:
    created_at = pd.to_datetime(order.get("createdAt") or order.get("created_at"))

    # Calculate delivery time in minutes if available
    delivery_minutes = None
    if order.get("delivered_at") and order.get("accepted_at"):
        delivered  = pd.to_datetime(order["delivered_at"])
        accepted   = pd.to_datetime(order["accepted_at"])
        delivery_minutes = (delivered - accepted).total_seconds() / 60

    # Count items from detail
    item_count = 0
    detail = order.get("foodDetail") or order.get("groceryDetail") or order.get("materialsDetail") or {}
    if detail and detail.get("items"):
        item_count = sum(item.get("qty", 1) for item in detail["items"])

    return {
        "order_id":         str(order["id"]),
        "customer_id":      str(order["customer_id"]),
        "city":             order.get("city", ""),
        "category_type":    order.get("category_type", ""),
        "hour_of_day":      created_at.hour,
        "day_of_week":      created_at.dayofweek,
        "is_weekend":       1 if created_at.dayofweek >= 5 else 0,
        "month":            created_at.month,
        "subtotal_usd":     float(order.get("subtotal_usd", 0) or 0),
        "delivery_fee_usd": float(order.get("delivery_fee_usd", 0) or 0),
        "total_usd":        float(order.get("total_usd", 0) or 0),
        "item_count":       item_count,
        "weight_kg":        float(order.get("weight_kg", 0) or 0),
        "vehicle_type":     order.get("vehicle_type", ""),
        "distance_km":      float(order.get("distance_km", 5) or 5),
        "delivery_minutes": delivery_minutes,
        "payment_method":   order.get("payment_method", ""),
        "payment_status":   order.get("payment_status", ""),
    }

# ─── Persist features to PostgreSQL ──────────────────────────────────────────
async def save_features(db: AsyncSession, features: dict):
    existing = await db.execute(
        text("SELECT id FROM order_features WHERE order_id = :order_id"),
        {"order_id": features["order_id"]}
    )
    if existing.fetchone():
        return  # already stored

    record = OrderFeature(**features)
    db.add(record)
    await db.commit()

# ─── Cache features in Redis ──────────────────────────────────────────────────
async def cache_features(order_id: str, features: dict, ttl: int = 3600):
    redis = get_redis()
    if redis:
        await redis.setex(
            f"features:{order_id}",
            ttl,
            json.dumps(features)
        )

# ─── Get features from cache or DB ───────────────────────────────────────────
async def get_features(db: AsyncSession, order_id: str) -> dict | None:
    redis = get_redis()

    # Try Redis first
    if redis:
        cached = await redis.get(f"features:{order_id}")
        if cached:
            return json.loads(cached)

    # Fall back to PostgreSQL
    result = await db.execute(
        text("SELECT * FROM order_features WHERE order_id = :order_id"),
        {"order_id": order_id}
    )
    row = result.fetchone()
    if row:
        return dict(row._mapping)
    return None

# ─── Load all features for model training ────────────────────────────────────
async def load_training_features(db: AsyncSession) -> pd.DataFrame:
    result = await db.execute(
        text("""
            SELECT hour_of_day, day_of_week, is_weekend, month,
                   subtotal_usd, delivery_fee_usd, total_usd,
                   item_count, weight_kg, distance_km,
                   delivery_minutes, anomaly_score
            FROM order_features
            WHERE payment_status IN ('success', 'pending')
            ORDER BY created_at DESC
            LIMIT 10000
        """)
    )
    rows = result.fetchall()
    if not rows:
        return pd.DataFrame()

    df = pd.DataFrame(rows, columns=result.keys())
    df = df.fillna(0)
    return df

# ─── Bulk extract from existing orders ───────────────────────────────────────
async def bulk_extract_from_db(db: AsyncSession) -> int:
    result = await db.execute(
        text("""
            SELECT o.*, 
                   EXTRACT(EPOCH FROM (o.delivered_at - o.accepted_at))/60 as delivery_minutes
            FROM orders o
            WHERE o.id NOT IN (SELECT order_id FROM order_features)
            LIMIT 1000
        """)
    )
    rows = result.fetchall()
    count = 0

    for row in rows:
        order = dict(row._mapping)
        features = extract_features(order)
        await save_features(db, features)
        await cache_features(order["id"], features)
        count += 1

    return count