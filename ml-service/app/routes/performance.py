from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.performance_service import (
    score_riders, score_vendors, platform_summary
)

router = APIRouter()

# ─── GET /performance/riders ──────────────────────────────────────────────────
@router.get("/riders")
async def rider_scores(
    city: str = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    return await score_riders(db, city)

# ─── GET /performance/vendors ─────────────────────────────────────────────────
@router.get("/vendors")
async def vendor_scores(
    city:     str = Query(default=None),
    category: str = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    return await score_vendors(db, city, category)

# ─── GET /performance/summary ─────────────────────────────────────────────────
@router.get("/summary")
async def get_platform_summary(db: AsyncSession = Depends(get_db)):
    return await platform_summary(db)