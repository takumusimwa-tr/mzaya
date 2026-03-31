import pandas as pd
import numpy as np
from prophet import Prophet
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timedelta
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

FORECAST_MODEL_PATH = "app/models/prophet_{city}_{category}.pkl"
MIN_PROPHET_SAMPLES = 24  # need at least 24 distinct hours for Prophet

# ─── Load training data from feature store ───────────────────────────────────
async def load_demand_data(db: AsyncSession, city: str = None, category: str = None) -> pd.DataFrame:
    where_clauses = ["1=1"]
    params = {}

    if city:
        where_clauses.append("city = :city")
        params["city"] = city
    if category:
        where_clauses.append("category_type = :category")
        params["category"] = category

    where = " AND ".join(where_clauses)

    result = await db.execute(
        text(f"""
            SELECT
                DATE_TRUNC('hour', created_at) as ds,
                COUNT(*) as y
            FROM order_features
            WHERE {where}
            GROUP BY ds
            ORDER BY ds
        """),
        params
    )
    rows = result.fetchall()
    if not rows or len(rows) < MIN_PROPHET_SAMPLES:
        return pd.DataFrame()

    df = pd.DataFrame(rows, columns=["ds", "y"])
    df["ds"] = pd.to_datetime(df["ds"]).dt.tz_localize(None)
    df["y"]  = df["y"].astype(float)
    return df

# ─── Train Prophet model ──────────────────────────────────────────────────────
async def train_forecast_model(
    db: AsyncSession,
    city: str = "harare",
    category: str = "food"
) -> dict:
    df = await load_demand_data(db, city, category)

    if df.empty:
        return {
            "status":  "skipped",
            "reason":  f"Need {MIN_PROPHET_SAMPLES}+ distinct hourly observations for {city}/{category}",
            "samples": 0,
        }

    model = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=True,
        daily_seasonality=True,
        changepoint_prior_scale=0.05,
    )
    model.fit(df)

    os.makedirs("app/models", exist_ok=True)
    model_path = FORECAST_MODEL_PATH.format(city=city, category=category)
    joblib.dump(model, model_path)

    return {
        "status":    "trained",
        "city":      city,
        "category":  category,
        "samples":   len(df),
        "modelPath": model_path,
    }

# ─── Statistical forecast (fallback when not enough data for Prophet) ─────────
async def statistical_forecast(
    db: AsyncSession,
    city: str,
    category: str,
    hours_ahead: int
) -> dict:
    result = await db.execute(
        text("""
            SELECT hour_of_day, COUNT(*) as order_count
            FROM order_features
            WHERE city = :city AND category_type = :category
            GROUP BY hour_of_day
            ORDER BY hour_of_day
        """),
        {"city": city, "category": category}
    )
    rows = result.fetchall()

    if not rows:
        return {
            "status": "error",
            "reason": f"No data available for {city}/{category}"
        }

    hourly_avg  = {row.hour_of_day: float(row.order_count) for row in rows}
    overall_avg = sum(hourly_avg.values()) / len(hourly_avg)

    now = datetime.utcnow()
    predictions = []
    for i in range(1, hours_ahead + 1):
        future_hour = now + timedelta(hours=i)
        hour_of_day = future_hour.hour
        expected    = hourly_avg.get(hour_of_day, overall_avg)
        predictions.append({
            "hour":        future_hour.strftime("%Y-%m-%d %H:00"),
            "expected":    round(expected, 2),
            "lower_bound": round(expected * 0.7, 2),
            "upper_bound": round(expected * 1.3, 2),
        })

    peak = max(predictions, key=lambda x: x["expected"])

    return {
        "status":      "ok",
        "method":      "statistical",
        "note":        f"Using statistical forecast — Prophet requires {MIN_PROPHET_SAMPLES}+ hours of data",
        "city":        city,
        "category":    category,
        "hours_ahead": hours_ahead,
        "peak_hour":   peak["hour"],
        "peak_demand": peak["expected"],
        "forecast":    predictions,
    }

# ─── Main forecast function ───────────────────────────────────────────────────
async def forecast_demand(
    db: AsyncSession,
    city: str = "harare",
    category: str = "food",
    hours_ahead: int = 24
) -> dict:
    model_path = FORECAST_MODEL_PATH.format(city=city, category=category)

    # Use Prophet if model exists
    if os.path.exists(model_path):
        model  = joblib.load(model_path)
        future = model.make_future_dataframe(periods=hours_ahead, freq="h")
        forecast = model.predict(future)

        future_only = forecast.tail(hours_ahead)[["ds", "yhat", "yhat_lower", "yhat_upper"]].copy()
        future_only["yhat"]       = future_only["yhat"].clip(lower=0).round(2)
        future_only["yhat_lower"] = future_only["yhat_lower"].clip(lower=0).round(2)
        future_only["yhat_upper"] = future_only["yhat_upper"].clip(lower=0).round(2)

        predictions = [
            {
                "hour":        row.ds.strftime("%Y-%m-%d %H:00"),
                "expected":    float(row.yhat),
                "lower_bound": float(row.yhat_lower),
                "upper_bound": float(row.yhat_upper),
            }
            for row in future_only.itertuples()
        ]
        peak = max(predictions, key=lambda x: x["expected"])

        return {
            "status":      "ok",
            "method":      "prophet",
            "city":        city,
            "category":    category,
            "hours_ahead": hours_ahead,
            "peak_hour":   peak["hour"],
            "peak_demand": peak["expected"],
            "forecast":    predictions,
        }

    # Try to train Prophet — if not enough data, fall back to statistical
    train_result = await train_forecast_model(db, city, category)
    if train_result["status"] == "trained":
        return await forecast_demand(db, city, category, hours_ahead)

    # Fall back to statistical forecast
    return await statistical_forecast(db, city, category, hours_ahead)

# ─── Get demand summary across all cities ────────────────────────────────────
async def demand_summary(db: AsyncSession) -> dict:
    result = await db.execute(
        text("""
            SELECT
                city,
                category_type,
                hour_of_day,
                COUNT(*) as order_count,
                AVG(total_usd) as avg_value
            FROM order_features
            GROUP BY city, category_type, hour_of_day
            ORDER BY city, category_type, hour_of_day
        """)
    )
    rows = result.fetchall()

    summary = {}
    for row in rows:
        key = f"{row.city}_{row.category_type}"
        if key not in summary:
            summary[key] = {
                "city":     row.city,
                "category": row.category_type,
                "by_hour":  [],
            }
        summary[key]["by_hour"].append({
            "hour":        row.hour_of_day,
            "order_count": row.order_count,
            "avg_value":   round(float(row.avg_value or 0), 2),
        })

    return {"summary": list(summary.values())}