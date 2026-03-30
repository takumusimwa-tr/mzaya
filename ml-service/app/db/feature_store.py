from sqlalchemy import Column, String, Float, DateTime, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

class OrderFeature(Base):
    """
    Engineered features extracted from each order.
    Used for ML model training and inference.
    """
    __tablename__ = "order_features"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id        = Column(String, nullable=False, unique=True, index=True)
    customer_id     = Column(String, nullable=False, index=True)
    city            = Column(String, nullable=False)
    category_type   = Column(String, nullable=False)

    # Time features
    hour_of_day     = Column(Integer, nullable=False)  # 0-23
    day_of_week     = Column(Integer, nullable=False)  # 0=Monday
    is_weekend      = Column(Integer, nullable=False)  # 0 or 1
    month           = Column(Integer, nullable=False)

    # Order value features
    subtotal_usd    = Column(Float, nullable=False, default=0)
    delivery_fee_usd= Column(Float, nullable=False, default=0)
    total_usd       = Column(Float, nullable=False, default=0)
    item_count      = Column(Integer, nullable=False, default=0)
    weight_kg       = Column(Float, nullable=True, default=0)

    # Delivery features
    vehicle_type    = Column(String, nullable=True)
    distance_km     = Column(Float, nullable=True)
    delivery_minutes= Column(Float, nullable=True)  # actual delivery time

    # Payment features
    payment_method  = Column(String, nullable=True)
    payment_status  = Column(String, nullable=True)

    # Anomaly score (set after inference)
    anomaly_score   = Column(Float, nullable=True)
    is_anomaly      = Column(Integer, nullable=True, default=0)  # 0 or 1

    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())


class ModelMetric(Base):
    """
    Tracks ML model performance over time.
    """
    __tablename__ = "model_metrics"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_name      = Column(String, nullable=False)  # e.g. 'isolation_forest_v1'
    model_version   = Column(String, nullable=False)
    total_samples   = Column(Integer, nullable=False, default=0)
    anomaly_count   = Column(Integer, nullable=False, default=0)
    anomaly_rate    = Column(Float, nullable=True)
    avg_std_dev     = Column(Float, nullable=True)
    last_trained_at = Column(DateTime(timezone=True), nullable=True)
    metrics         = Column(JSON, nullable=True)  # extra metrics dict
    created_at      = Column(DateTime(timezone=True), server_default=func.now())