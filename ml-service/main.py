from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

load_dotenv()

from app.db.database import init_db
from app.db.redis_client import init_redis
from app.routes import analytics, anomaly, features

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    await init_redis()
    print("Mzaya ML service ready")
    yield
    # Shutdown
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

app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(anomaly.router,   prefix="/anomaly",   tags=["Anomaly Detection"])
app.include_router(features.router,  prefix="/features",  tags=["Features"])

@app.get("/")
def health():
    return {
        "status": "ok",
        "service": "Mzaya ML",
        "version": "1.0.0",
        "endpoints": ["/analytics", "/anomaly", "/features"],
    }