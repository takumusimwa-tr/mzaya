from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.forecast_service import (
    train_forecast_model, forecast_demand, demand_summary
)

router = APIRouter()

# ─── POST /forecast/train ─────────────────────────────────────────────────────
@router.post("/train")
async def train_forecast(
    city:     str = Query(default="harare"),
    category: str = Query(default="food"),
    db: AsyncSession = Depends(get_db)
):
    result = await train_forecast_model(db, city, category)
    return result

# ─── GET /forecast/predict ───────────────────────────────────────────────────
@router.get("/predict")
async def predict_demand(
    city:        str = Query(default="harare"),
    category:    str = Query(default="food"),
    hours_ahead: int = Query(default=24, ge=1, le=168),
    db: AsyncSession = Depends(get_db)
):
    result = await forecast_demand(db, city, category, hours_ahead)
    return result

# ─── GET /forecast/summary ───────────────────────────────────────────────────
@router.get("/summary")
async def get_demand_summary(db: AsyncSession = Depends(get_db)):
    result = await demand_summary(db)
    return result