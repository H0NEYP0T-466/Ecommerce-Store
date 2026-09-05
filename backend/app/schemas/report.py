from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class OrderReportResponse(BaseModel):
    this_month_count: int
    last_month_count: int
    total_count: int
    recent_orders: list


class ProductRankItem(BaseModel):
    rank: int
    product_id: str
    product_name: str
    category_name: Optional[str] = None
    units_sold: int
    revenue: float


class ProductReportResponse(BaseModel):
    products: List[ProductRankItem]
    period: str


class FinanceReportResponse(BaseModel):
    total_revenue: float
    total_orders: int
    average_order_value: float
    this_month_revenue: float
    this_month_orders: int
    top_products: List[ProductRankItem]


class NotificationResponse(BaseModel):
    id: str
    type: str
    entity_id: str
    message: str
    is_read: bool
    created_at: datetime
