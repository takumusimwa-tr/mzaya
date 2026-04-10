import pandas as pd
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timedelta

# ─── Rider Performance Scoring ───────────────────────────────────────────────
# Score = weighted combination of:
#   - On-time delivery rate (40%)
#   - Acceptance rate (25%)
#   - Average delivery time (20%)
#   - Order completion rate (15%)

async def score_riders(db: AsyncSession, city: str = None) -> dict:
    where = "AND o.city = :city" if city else ""
    params = {"city": city} if city else {}

    result = await db.execute(
        text(f"""
            SELECT
                o.rider_id,
                u.name                                          as rider_name,
                u.phone                                         as rider_phone,
                COUNT(*)                                        as total_assigned,
                SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END)
                                                                as completed,
                SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END)
                                                                as cancelled,
                AVG(
                    EXTRACT(EPOCH FROM (o.delivered_at - o.accepted_at)) / 60
                )                                               as avg_delivery_minutes,
                AVG(
                    EXTRACT(EPOCH FROM (o.accepted_at - o."createdAt")) / 60
                )                                               as avg_acceptance_minutes
            FROM orders o
            JOIN users u ON u.id = o.rider_id
            WHERE o.rider_id IS NOT NULL
              AND o.status IN ('delivered', 'cancelled')
              {where}
            GROUP BY o.rider_id, u.name, u.phone
            HAVING COUNT(*) >= 1
        """),
        params
    )
    rows = result.fetchall()

    if not rows:
        return {"status": "ok", "riders": [], "message": "No rider data yet"}

    riders = []
    for row in rows:
        total      = row.total_assigned or 1
        completed  = row.completed or 0
        cancelled  = row.cancelled or 0
        avg_mins   = float(row.avg_delivery_minutes or 30)
        avg_accept = float(row.avg_acceptance_minutes or 5)

        completion_rate  = completed / total
        cancellation_rate = cancelled / total

        # Delivery time score — faster is better
        # Benchmark: 30 mins = 1.0, 60 mins = 0.5, 15 mins = 1.5 (capped at 1.0)
        time_score = min(1.0, 30 / max(avg_mins, 1))

        # Acceptance speed score — faster acceptance = better
        accept_score = min(1.0, 5 / max(avg_accept, 1))

        # Weighted composite score (0-100)
        raw_score = (
            completion_rate  * 0.40 +
            accept_score     * 0.25 +
            time_score       * 0.20 +
            (1 - cancellation_rate) * 0.15
        )
        score = round(raw_score * 100, 1)

        # Grade
        if score >= 85:   grade = "A"
        elif score >= 70: grade = "B"
        elif score >= 55: grade = "C"
        elif score >= 40: grade = "D"
        else:             grade = "F"

        riders.append({
            "rider_id":            str(row.rider_id),
            "name":                row.rider_name,
            "phone":               row.rider_phone,
            "total_orders":        total,
            "completed":           completed,
            "cancelled":           cancelled,
            "completion_rate":     round(completion_rate * 100, 1),
            "avg_delivery_mins":   round(avg_mins, 1),
            "avg_acceptance_mins": round(avg_accept, 1),
            "score":               score,
            "grade":               grade,
        })

    # Sort by score descending
    riders.sort(key=lambda x: x["score"], reverse=True)

    return {
        "status":      "ok",
        "city":        city or "all",
        "total_riders": len(riders),
        "riders":      riders,
        "top_rider":   riders[0] if riders else None,
    }

# ─── Vendor Performance Scoring ──────────────────────────────────────────────
# Score = weighted combination of:
#   - Order fulfillment rate (35%)
#   - Average prep time (30%)
#   - Order volume (20%)
#   - Cancellation rate (15%)

async def score_vendors(db: AsyncSession, city: str = None, category: str = None) -> dict:
    where_clauses = ["o.status IN ('delivered', 'cancelled', 'accepted', 'picked_up')"]
    params = {}

    if city:
        where_clauses.append("o.city = :city")
        params["city"] = city
    if category:
        where_clauses.append("o.category_type = :category")
        params["category"] = category

    where = " AND ".join(where_clauses)

    result = await db.execute(
        text(f"""
            SELECT
                f.restaurant_id                                 as vendor_id,
                f.restaurant_name                               as vendor_name,
                'food'                                          as category,
                COUNT(*)                                        as total_orders,
                SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END)
                                                                as fulfilled,
                SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END)
                                                                as cancelled,
                AVG(f.estimated_prep_minutes)                   as avg_prep_minutes,
                SUM(o.total_usd)                                as total_revenue
            FROM order_food_details f
            JOIN orders o ON o.id = f.order_id
            WHERE {where}
            GROUP BY f.restaurant_id, f.restaurant_name
            HAVING COUNT(*) >= 1

            UNION ALL

            SELECT
                g.store_id                                      as vendor_id,
                g.store_name                                    as vendor_name,
                'grocery'                                       as category,
                COUNT(*)                                        as total_orders,
                SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END)
                                                                as fulfilled,
                SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END)
                                                                as cancelled,
                NULL                                            as avg_prep_minutes,
                SUM(o.total_usd)                                as total_revenue
            FROM order_grocery_details g
            JOIN orders o ON o.id = g.order_id
            WHERE {where}
            GROUP BY g.store_id, g.store_name
            HAVING COUNT(*) >= 1
        """),
        params
    )
    rows = result.fetchall()

    if not rows:
        return {"status": "ok", "vendors": [], "message": "No vendor data yet"}

    vendors = []
    for row in rows:
        total     = row.total_orders or 1
        fulfilled = row.fulfilled or 0
        cancelled = row.cancelled or 0
        prep_mins = float(row.avg_prep_minutes or 20)
        revenue   = float(row.total_revenue or 0)

        fulfillment_rate  = fulfilled / total
        cancellation_rate = cancelled / total

        # Prep time score — faster is better (benchmark: 20 mins = 1.0)
        prep_score = min(1.0, 20 / max(prep_mins, 1))

        # Volume score — normalized (max 1.0 at 100+ orders)
        volume_score = min(1.0, total / 100)

        # Weighted composite score (0-100)
        raw_score = (
            fulfillment_rate          * 0.35 +
            prep_score                * 0.30 +
            volume_score              * 0.20 +
            (1 - cancellation_rate)   * 0.15
        )
        score = round(raw_score * 100, 1)

        if score >= 85:   grade = "A"
        elif score >= 70: grade = "B"
        elif score >= 55: grade = "C"
        elif score >= 40: grade = "D"
        else:             grade = "F"

        vendors.append({
            "vendor_id":       str(row.vendor_id),
            "name":            row.vendor_name,
            "category":        row.category,
            "total_orders":    total,
            "fulfilled":       fulfilled,
            "cancelled":       cancelled,
            "fulfillment_rate": round(fulfillment_rate * 100, 1),
            "avg_prep_minutes": round(prep_mins, 1),
            "total_revenue_usd": round(revenue, 2),
            "score":           score,
            "grade":           grade,
        })

    vendors.sort(key=lambda x: x["score"], reverse=True)

    return {
        "status":        "ok",
        "city":          city or "all",
        "category":      category or "all",
        "total_vendors": len(vendors),
        "vendors":       vendors,
        "top_vendor":    vendors[0] if vendors else None,
    }

# ─── Platform-wide performance summary ───────────────────────────────────────
async def platform_summary(db: AsyncSession) -> dict:
    result = await db.execute(
        text("""
            SELECT
                COUNT(*)                                        as total_orders,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)
                                                                as delivered,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)
                                                                as cancelled,
                AVG(total_usd)                                  as avg_order_value,
                SUM(total_usd)                                  as total_revenue,
                AVG(
                    EXTRACT(EPOCH FROM (delivered_at - accepted_at)) / 60
                )                                               as avg_delivery_minutes,
                COUNT(DISTINCT customer_id)                     as unique_customers,
                COUNT(DISTINCT rider_id)                        as active_riders
            FROM orders
            WHERE status != 'pending'
        """)
    )
    row = result.fetchone()

    total     = row.total_orders or 1
    delivered = row.delivered or 0
    cancelled = row.cancelled or 0

    return {
        "status": "ok",
        "platform": {
            "total_orders":          total,
            "delivered":             delivered,
            "cancelled":             cancelled,
            "delivery_rate":         round((delivered / total) * 100, 1),
            "cancellation_rate":     round((cancelled / total) * 100, 1),
            "avg_order_value_usd":   round(float(row.avg_order_value or 0), 2),
            "total_revenue_usd":     round(float(row.total_revenue or 0), 2),
            "avg_delivery_minutes":  round(float(row.avg_delivery_minutes or 0), 1),
            "unique_customers":      row.unique_customers or 0,
            "active_riders":         row.active_riders or 0,
        }
    }