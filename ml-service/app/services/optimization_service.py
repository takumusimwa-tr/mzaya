import pandas as pd
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timedelta

# ─── Fee optimization constants ───────────────────────────────────────────────
# Cost per km per vehicle type (USD) — fuel + depreciation estimate
VEHICLE_COST_PER_KM = {
    "bike":   0.08,
    "bakkie": 0.25,
    "truck":  0.55,
}

# Minimum acceptable margin per delivery (USD)
MIN_MARGIN = {
    "bike":   1.00,
    "bakkie": 3.00,
    "truck":  8.00,
}

# Surge multipliers by demand level
SURGE_MULTIPLIERS = {
    "low":    0.85,  # discount during low demand
    "normal": 1.00,
    "high":   1.25,  # surge during peak hours
    "peak":   1.50,  # extreme surge
}

# ─── Analyze fee efficiency ───────────────────────────────────────────────────
async def analyze_fee_efficiency(db: AsyncSession, city: str = None) -> dict:
    where = "AND city = :city" if city else ""
    params = {"city": city} if city else {}

    result = await db.execute(
        text(f"""
            SELECT
                category_type,
                vehicle_type,
                COUNT(*)                    as total_orders,
                AVG(subtotal_usd)           as avg_subtotal,
                AVG(delivery_fee_usd)       as avg_delivery_fee,
                AVG(total_usd)              as avg_total,
                MIN(delivery_fee_usd)       as min_fee,
                MAX(delivery_fee_usd)       as max_fee,
                STDDEV(delivery_fee_usd)    as fee_std_dev,
                AVG(distance_km)            as avg_distance_km
            FROM order_features
            WHERE vehicle_type IS NOT NULL
            {where}
            GROUP BY category_type, vehicle_type
            ORDER BY category_type, vehicle_type
        """),
        params
    )
    rows = result.fetchall()

    if not rows:
        return {"status": "ok", "analysis": [], "message": "No data yet"}

    analysis = []
    for row in rows:
        vehicle    = row.vehicle_type or "bike"
        avg_fee    = float(row.avg_delivery_fee or 0)
        avg_dist   = float(row.avg_distance_km or 5)
        total      = row.total_orders

        # Estimated cost per delivery
        cost_per_delivery = avg_dist * VEHICLE_COST_PER_KM.get(vehicle, 0.08)
        min_margin        = MIN_MARGIN.get(vehicle, 1.00)
        break_even_fee    = cost_per_delivery + min_margin

        # Is current fee profitable?
        margin            = avg_fee - cost_per_delivery
        is_profitable     = margin >= min_margin
        suggested_fee     = max(break_even_fee, avg_fee * 1.05)  # at least 5% above breakeven

        # Fee variance — high variance means inconsistent pricing
        fee_variance = float(row.fee_std_dev or 0)
        pricing_consistency = "stable" if fee_variance < 0.5 else "variable"

        analysis.append({
            "category_type":        row.category_type,
            "vehicle_type":         vehicle,
            "total_orders":         total,
            "avg_subtotal_usd":     round(float(row.avg_subtotal or 0), 2),
            "avg_delivery_fee_usd": round(avg_fee, 2),
            "avg_total_usd":        round(float(row.avg_total or 0), 2),
            "avg_distance_km":      round(avg_dist, 2),
            "cost_per_delivery":    round(cost_per_delivery, 2),
            "margin_usd":           round(margin, 2),
            "is_profitable":        is_profitable,
            "suggested_fee_usd":    round(suggested_fee, 2),
            "fee_variance":         round(fee_variance, 2),
            "pricing_consistency":  pricing_consistency,
            "recommendation":       _fee_recommendation(avg_fee, break_even_fee, margin, min_margin),
        })

    return {
        "status":   "ok",
        "city":     city or "all",
        "analysis": analysis,
    }

# ─── Calculate surge pricing for current demand ───────────────────────────────
async def calculate_surge(
    db: AsyncSession,
    city: str,
    category: str,
    hour_of_day: int = None
) -> dict:
    if hour_of_day is None:
        hour_of_day = datetime.utcnow().hour

    # Get average orders for this hour vs overall average
    result = await db.execute(
        text("""
            SELECT
                AVG(hourly_count) as overall_avg,
                MAX(CASE WHEN hour_of_day = :hour THEN hourly_count END) as current_hour_count
            FROM (
                SELECT hour_of_day, COUNT(*) as hourly_count
                FROM order_features
                WHERE city = :city AND category_type = :category
                GROUP BY hour_of_day
            ) hourly
        """),
        {"city": city, "category": category, "hour": hour_of_day}
    )
    row = result.fetchone()

    overall_avg   = float(row.overall_avg or 1)
    current_count = float(row.current_hour_count or 0)

    # Demand ratio
    demand_ratio = current_count / overall_avg if overall_avg > 0 else 1.0

    # Determine surge level
    if demand_ratio >= 2.0:
        level      = "peak"
        multiplier = SURGE_MULTIPLIERS["peak"]
    elif demand_ratio >= 1.5:
        level      = "high"
        multiplier = SURGE_MULTIPLIERS["high"]
    elif demand_ratio >= 0.8:
        level      = "normal"
        multiplier = SURGE_MULTIPLIERS["normal"]
    else:
        level      = "low"
        multiplier = SURGE_MULTIPLIERS["low"]

    return {
        "status":        "ok",
        "city":          city,
        "category":      category,
        "hour_of_day":   hour_of_day,
        "demand_ratio":  round(demand_ratio, 2),
        "surge_level":   level,
        "multiplier":    multiplier,
        "description":   _surge_description(level, multiplier),
    }

# ─── Spend optimization report ────────────────────────────────────────────────
async def optimization_report(db: AsyncSession) -> dict:
    # Revenue by category
    revenue = await db.execute(
        text("""
            SELECT
                category_type,
                COUNT(*)            as orders,
                SUM(total_usd)      as revenue,
                SUM(delivery_fee_usd) as fee_revenue,
                AVG(total_usd)      as avg_order_value,
                SUM(total_usd) / NULLIF(COUNT(*), 0) as revenue_per_order
            FROM order_features
            GROUP BY category_type
            ORDER BY revenue DESC
        """)
    )
    revenue_rows = revenue.fetchall()

    # Peak hours
    peak = await db.execute(
        text("""
            SELECT
                hour_of_day,
                COUNT(*) as order_count,
                AVG(total_usd) as avg_value
            FROM order_features
            GROUP BY hour_of_day
            ORDER BY order_count DESC
            LIMIT 5
        """)
    )
    peak_rows = peak.fetchall()

    # Payment method distribution
    payments = await db.execute(
        text("""
            SELECT
                payment_method,
                COUNT(*) as count,
                SUM(total_usd) as total_value
            FROM order_features
            WHERE payment_method IS NOT NULL
            GROUP BY payment_method
            ORDER BY count DESC
        """)
    )
    payment_rows = payments.fetchall()

    return {
        "status": "ok",
        "revenue_by_category": [
            {
                "category":          r.category_type,
                "orders":            r.orders,
                "total_revenue_usd": round(float(r.revenue or 0), 2),
                "fee_revenue_usd":   round(float(r.fee_revenue or 0), 2),
                "avg_order_usd":     round(float(r.avg_order_value or 0), 2),
            }
            for r in revenue_rows
        ],
        "peak_hours": [
            {
                "hour":        r.hour_of_day,
                "order_count": r.order_count,
                "avg_value":   round(float(r.avg_value or 0), 2),
            }
            for r in peak_rows
        ],
        "payment_methods": [
            {
                "method":      r.payment_method,
                "count":       r.count,
                "total_value": round(float(r.total_value or 0), 2),
            }
            for r in payment_rows
        ],
    }

# ─── Helpers ──────────────────────────────────────────────────────────────────
def _fee_recommendation(avg_fee, break_even, margin, min_margin):
    if avg_fee < break_even:
        return f"Increase fee — currently below break-even by ${round(break_even - avg_fee, 2)}"
    elif margin < min_margin * 1.2:
        return f"Slightly increase fee — margin is thin at ${round(margin, 2)}"
    elif margin > min_margin * 3:
        return "Consider reducing fee to drive more volume"
    else:
        return "Fee is well optimized"

def _surge_description(level, multiplier):
    descriptions = {
        "low":    f"Low demand — {int((1-multiplier)*100)}% discount applied",
        "normal": "Normal demand — standard pricing",
        "high":   f"High demand — {int((multiplier-1)*100)}% surge applied",
        "peak":   f"Peak demand — {int((multiplier-1)*100)}% surge applied",
    }
    return descriptions.get(level, "Standard pricing")