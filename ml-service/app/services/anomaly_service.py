import numpy as np
import pandas as pd
import joblib
import os
from sklearn.ensemble import IsolationForest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.services.feature_service import extract_features, load_training_features
from datetime import datetime

MODEL_PATH = "app/models/isolation_forest.pkl"
MODEL_VERSION = "1.0.0"

FEATURE_COLS = [
    "hour_of_day", "day_of_week", "is_weekend", "month",
    "subtotal_usd", "delivery_fee_usd", "total_usd",
    "item_count", "weight_kg", "distance_km",
]

# ─── Load model from disk ─────────────────────────────────────────────────────
def load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return None

# ─── Train Isolation Forest ───────────────────────────────────────────────────
async def train_model(db: AsyncSession) -> dict:
    df = await load_training_features(db)

    if df.empty or len(df) < 10:
        return {
            "status": "skipped",
            "reason": "Not enough training data — need at least 10 orders",
            "samples": len(df),
        }

    X = df[FEATURE_COLS].fillna(0).values

    model = IsolationForest(
        n_estimators=100,
        contamination=0.05,  # expect ~5% anomalies
        random_state=42,
    )
    model.fit(X)

    # Save model
    os.makedirs("app/models", exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    # Calculate metrics
    scores      = model.decision_function(X)
    predictions = model.predict(X)
    anomaly_count = int(np.sum(predictions == -1))
    anomaly_rate  = round(anomaly_count / len(X), 4)
    avg_std_dev   = round(float(np.std(scores)), 4)

    # Save metrics to DB
    await db.execute(
        text("""
            INSERT INTO model_metrics
              (id, model_name, model_version, total_samples, anomaly_count,
               anomaly_rate, avg_std_dev, last_trained_at)
            VALUES
              (gen_random_uuid(), :name, :version, :total, :anomalies,
               :rate, :std, :trained_at)
        """),
        {
            "name":       "isolation_forest",
            "version":    MODEL_VERSION,
            "total":      len(X),
            "anomalies":  anomaly_count,
            "rate":       anomaly_rate,
            "std":        avg_std_dev,
            "trained_at": datetime.utcnow(),
        }
    )
    await db.commit()

    return {
        "status":       "trained",
        "samples":      len(X),
        "anomalyCount": anomaly_count,
        "anomalyRate":  anomaly_rate,
        "avgStdDev":    avg_std_dev,
        "modelVersion": MODEL_VERSION,
        "trainedAt":    datetime.utcnow().isoformat(),
    }

# ─── Score all unscored orders ────────────────────────────────────────────────
async def detect_anomalies(db: AsyncSession) -> dict:
    model = load_model()
    if not model:
        return {"status": "error", "reason": "Model not trained yet. Call /anomaly/train first."}

    result = await db.execute(
        text("""
            SELECT * FROM order_features
            WHERE anomaly_score IS NULL
            LIMIT 500
        """)
    )
    rows = result.fetchall()
    if not rows:
        return {"status": "ok", "message": "No unscored orders found", "scored": 0}

    df = pd.DataFrame(rows, columns=result.keys())
    X  = df[FEATURE_COLS].fillna(0).values

    scores      = model.decision_function(X)
    predictions = model.predict(X)

    for i, row in enumerate(rows):
        is_anomaly = 1 if predictions[i] == -1 else 0
        await db.execute(
            text("""
                UPDATE order_features
                SET anomaly_score = :score, is_anomaly = :is_anomaly
                WHERE order_id = :order_id
            """),
            {
                "score":      float(scores[i]),
                "is_anomaly": is_anomaly,
                "order_id":   row.order_id,
            }
        )

    await db.commit()

    anomaly_count = int(np.sum(predictions == -1))
    return {
        "status":       "ok",
        "scored":       len(rows),
        "anomalyCount": anomaly_count,
        "anomalyRate":  round(anomaly_count / len(rows), 4),
    }

# ─── Score a single order in real time ───────────────────────────────────────
async def score_single_order(order: dict, db: AsyncSession) -> dict:
    model = load_model()
    if not model:
        return {"status": "error", "reason": "Model not trained yet"}

    features = extract_features(order)
    X = np.array([[
        features[col] for col in FEATURE_COLS
    ]])

    score      = float(model.decision_function(X)[0])
    prediction = model.predict(X)[0]
    is_anomaly = prediction == -1

    # Update score in feature store if record exists
    await db.execute(
        text("""
            UPDATE order_features
            SET anomaly_score = :score, is_anomaly = :is_anomaly
            WHERE order_id = :order_id
        """),
        {
            "score":      score,
            "is_anomaly": 1 if is_anomaly else 0,
            "order_id":   str(order["id"]),
        }
    )
    await db.commit()

    return {
        "order_id":   str(order["id"]),
        "score":      round(score, 4),
        "is_anomaly": is_anomaly,
        "risk_level": "high" if score < -0.2 else "medium" if score < 0 else "low",
    }