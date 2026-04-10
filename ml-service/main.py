from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import logging

load_dotenv()

from app.db.database import init_db
from app.db.redis_client import init_redis
from app.routes import analytics, anomaly, features
from app.routes.forecast import router as forecast_router
from app.routes.performance import router as performance_router
from app.routes.optimization import router as optimization_router
from app.scheduler import start_scheduler, scheduler

logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await init_redis()
    start_scheduler()
    print("Mzaya ML service ready")
    yield
    scheduler.shutdown(wait=False)
    print("Mzaya ML service shutting down")

app = FastAPI(
    title="Mzaya ML Service",
    description="Procurement intelligence and ML platform for Mzaya",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics.router,      prefix="/analytics",     tags=["Analytics"])
app.include_router(anomaly.router,        prefix="/anomaly",       tags=["Anomaly Detection"])
app.include_router(features.router,       prefix="/features",      tags=["Features"])
app.include_router(forecast_router,       prefix="/forecast",      tags=["Demand Forecasting"])
app.include_router(performance_router,    prefix="/performance",   tags=["Performance Scoring"])
app.include_router(optimization_router,   prefix="/optimization",  tags=["Spend Optimization"])

@app.get("/")
def health():
    return {
        "status":    "ok",
        "service":   "Mzaya ML",
        "version":   "1.0.0",
        "endpoints": [
            "/analytics",
            "/anomaly",
            "/features",
            "/forecast",
            "/performance",
            "/optimization",
        ],
    }