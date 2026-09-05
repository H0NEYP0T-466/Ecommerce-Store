from datetime import datetime
from enum import Enum

from beanie import Document, Indexed
from pydantic import Field


class NotificationType(str, Enum):
    NEW_ORDER = "new_order"
    NEW_REVIEW = "new_review"
    LOW_STOCK = "low_stock"
    PAYMENT_RECEIVED = "payment_received"


class Notification(Document):
    """Admin notification document for real-time updates."""

    type: NotificationType
    entity_id: str  # ID of related order, review, product, etc.
    message: str
    is_read: bool = False

    created_at: Indexed(datetime) = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "notifications"
        indexes = ["is_read"]
