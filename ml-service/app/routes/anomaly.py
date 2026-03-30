from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.database import get_db
from app.services.anomaly_service import (
    train_model, detect_anomalies, score_single_order
)
from pydantic import BaseModel
from typing import Any

router = APIRouter()

class OrderPayload(BaseModel):
    order: dict[str, Any]

# ─── POST /anomaly/train ──────────────────────────────────────────────────────
@router.post("/train")
async def train(db: AsyncSession = Depends(get_db)):
    result = await train_model(db)
    return result

# ─── POST /anomaly/detect ─────────────────────────────────────────────────────
# Score a batch of recent orders
@router.post("/detect")
async def detect(db: AsyncSession = Depends(get_db)):
    result = await detect_anomalies(db)
    return result

# ─── POST /anomaly/score ──────────────────────────────────────────────────────
# Score a single order in real time
@router.post("/score")
async def score(
    payload: OrderPayload,
    db: AsyncSession = Depends(get_db)
):
    result = await score_single_order(payload.order, db)
    return result

# ─── GET /anomaly/list ────────────────────────────────────────────────────────
@router.get("/list")
async def list_anomalies(
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        text("""
            SELECT order_id, customer_id, city, category_type,
                   total_usd, anomaly_score, created_at
            FROM order_features
            WHERE is_anomaly = 1
            ORDER BY anomaly_score DESC
            LIMIT :limit
        """),
        {"limit": limit}
    )
    rows = result.fetchall()
    return {
        "anomalies": [
            {
                "order_id":      r.order_id,
                "customer_id":   r.customer_id,
                "city":          r.city,
                "category_type": r.category_type,
                "total_usd":     float(r.total_usd or 0),
                "anomaly_score": float(r.anomaly_score or 0),
                "detected_at":   r.created_at.isoformat(),
            }
            for r in rows
        ]
    }