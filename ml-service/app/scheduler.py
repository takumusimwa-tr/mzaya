from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import AsyncSessionLocal
from app.services.anomaly_service import train_model, detect_anomalies
from app.services.feature_service import bulk_extract_from_db
from app.services.forecast_service import train_forecast_model
import logging

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="Africa/Harare")

# ─── Job: bulk extract new features ──────────────────────────────────────────
async def job_extract_features():
    logger.info("[Scheduler] Running feature extraction...")
    async with AsyncSessionLocal() as db:
        count = await bulk_extract_from_db(db)
        logger.info(f"[Scheduler] Extracted features for {count} new orders")

# ─── Job: retrain anomaly detection model ────────────────────────────────────
async def job_retrain_anomaly():
    logger.info("[Scheduler] Retraining anomaly detection model...")
    async with AsyncSessionLocal() as db:
        result = await train_model(db)
        logger.info(f"[Scheduler] Anomaly model result: {result['status']}")

# ─── Job: detect anomalies on new orders ─────────────────────────────────────
async def job_detect_anomalies():
    logger.info("[Scheduler] Running anomaly detection...")
    async with AsyncSessionLocal() as db:
        result = await detect_anomalies(db)
        logger.info(f"[Scheduler] Scored {result.get('scored', 0)} orders, "
                    f"found {result.get('anomalyCount', 0)} anomalies")

# ─── Job: retrain demand forecasting models ───────────────────────────────────
async def job_retrain_forecast():
    logger.info("[Scheduler] Retraining demand forecast models...")
    cities     = ["harare", "bulawayo", "mutare"]
    categories = ["food", "grocery", "materials", "errand"]

    async with AsyncSessionLocal() as db:
        for city in cities:
            for category in categories:
                result = await train_forecast_model(db, city, category)
                logger.info(f"[Scheduler] Forecast {city}/{category}: {result['status']}")

# ─── Register all jobs ────────────────────────────────────────────────────────
def start_scheduler():
    # Extract features every 30 minutes
    scheduler.add_job(
        job_extract_features,
        CronTrigger(minute="*/30"),
        id="extract_features",
        replace_existing=True,
    )

    # Detect anomalies every hour
    scheduler.add_job(
        job_detect_anomalies,
        CronTrigger(minute=5),  # 5 mins past every hour
        id="detect_anomalies",
        replace_existing=True,
    )

    # Retrain anomaly model daily at 02:00 CAT
    scheduler.add_job(
        job_retrain_anomaly,
        CronTrigger(hour=0, minute=0, timezone="Africa/Harare"),  # midnight UTC = 2am CAT
        id="retrain_anomaly",
        replace_existing=True,
    )

    # Retrain forecast models daily at 03:00 CAT
    scheduler.add_job(
        job_retrain_forecast,
        CronTrigger(hour=1, minute=0, timezone="Africa/Harare"),
        id="retrain_forecast",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("[Scheduler] All jobs scheduled:")
    logger.info("  - Feature extraction: every 30 mins")
    logger.info("  - Anomaly detection:  every hour")
    logger.info("  - Model retraining:   daily 02:00 CAT")
    logger.info("  - Forecast retraining: daily 03:00 CAT")
    print("[Scheduler] Background jobs started")