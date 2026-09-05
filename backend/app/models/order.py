from datetime import datetime
from enum import Enum
from typing import Optional, List

from beanie import Document, Indexed
from pydantic import Field, BaseModel


class OrderStatus(str, Enum):
    RECEIVED = "received"
    PACKING = "packing"
    DISPATCHED = "dispatched"
    DELIVERED = "delivered"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"


class OrderItem(BaseModel):
    """Snapshot of product at time of order — prices never change after placement."""

    product_variation_id: str
    product_name: str
    color: str
    size: Optional[str] = None
    quantity: int
    unit_price: float
    subtotal: float


class StatusHistoryEntry(BaseModel):
    """Status change log entry."""

    status: OrderStatus
    changed_by: str  # User ID or "system"
    changed_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None


class Order(Document):
    """Order document — created at checkout with price snapshots."""

    order_number: Indexed(str, unique=True)  # Format: HC-YYYYMMDD-XXXX
    user_id: Indexed(str)
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str

    items: List[OrderItem]
    total_amount: float

    payment_method: Optional[str] = None  # Bank name or "gateway"
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_proof_url: Optional[str] = None  # GridFS file ID
    transaction_id: Optional[str] = None  # User-provided

    status: OrderStatus = OrderStatus.RECEIVED
    status_history: List[StatusHistoryEntry] = Field(default_factory=list)

    additional_notes: Optional[str] = None

    created_at: Indexed(datetime) = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "orders"


class OrderCounter(Document):
    """Atomic daily counter for generating sequential order numbers.
    
    One document per day. Uses MongoDB $inc for atomic increments.
    """

    date_key: Indexed(str, unique=True)  # Format: YYYYMMDD
    counter: int = 0

    class Settings:
        name = "order_counters"
