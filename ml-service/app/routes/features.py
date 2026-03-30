from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.feature_service import (
    extract_features, save_features, cache_features,
    get_features, bulk_extract_from_db
)
from pydantic import BaseModel
from typing import Any

router = APIRouter()

class OrderPayload(BaseModel):
    order: dict[str, Any]

# ─── POST /features/extract ───────────────────────────────────────────────────
# Called by Node backend when an order is created
@router.post("/extract")
async def extract_order_features(
    payload: OrderPayload,
    db: AsyncSession = Depends(get_db)
):
    features = extract_features(payload.order)
    await save_features(db, features)
    await cache_features(payload.order["id"], features)
    return {"message": "Features extracted", "features": features}

# ─── GET /features/{order_id} ────────────────────────────────────────────────
@router.get("/{order_id}")
async def get_order_features(
    order_id: str,
    db: AsyncSession = Depends(get_db)
):
    features = await get_features(db, order_id)
    if not features:
        raise HTTPException(status_code=404, detail="Features not found")
    return {"features": features}

# ─── POST /features/bulk-extract ─────────────────────────────────────────────
# Backfill features for all existing orders
@router.post("/bulk-extract")
async def bulk_extract(db: AsyncSession = Depends(get_db)):
    count = await bulk_extract_from_db(db)
    return {"message": f"Extracted features for {count} orders"}