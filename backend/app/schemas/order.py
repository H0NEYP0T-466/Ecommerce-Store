from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class OrderCreateRequest(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    additional_notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    product_variation_id: str
    product_name: str
    color: str
    size: Optional[str] = None
    quantity: int
    unit_price: float
    subtotal: float


class StatusHistoryResponse(BaseModel):
    status: str
    changed_by: str
    changed_at: datetime
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: str
    order_number: str
    user_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    items: List[OrderItemResponse]
    total_amount: float
    payment_method: Optional[str] = None
    payment_status: str
    payment_proof_url: Optional[str] = None
    transaction_id: Optional[str] = None
    status: str
    status_history: List[StatusHistoryResponse]
    additional_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    page: int
    page_size: int


class OrderStatusUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None


class PaymentProofUploadResponse(BaseModel):
    message: str
    payment_proof_url: str
