from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.optimization_service import (
    analyze_fee_efficiency, calculate_surge, optimization_report
)

router = APIRouter()

# ─── GET /optimization/fees ───────────────────────────────────────────────────
@router.get("/fees")
async def fee_analysis(
    city: str = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    return await analyze_fee_efficiency(db, city)

# ─── GET /optimization/surge ─────────────────────────────────────────────────
@router.get("/surge")
async def surge_pricing(
    city:        str = Query(default="harare"),
    category:    str = Query(default="food"),
    hour_of_day: int = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    return await calculate_surge(db, city, category, hour_of_day)

# ─── GET /optimization/report ─────────────────────────────────────────────────
@router.get("/report")
async def get_optimization_report(db: AsyncSession = Depends(get_db)):
    return await optimization_report(db)