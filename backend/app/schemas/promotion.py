from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PromotionCreateRequest(BaseModel):
    title: str
    description: str = ""
    discount_percent: float = Field(ge=0, le=100)
    selected_product_ids: List[str] = []
    is_active: bool = False
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class PromotionUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    discount_percent: Optional[float] = Field(default=None, ge=0, le=100)
    selected_product_ids: Optional[List[str]] = None
    is_active: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class PromotionResponse(BaseModel):
    id: str
    title: str
    description: str
    discount_percent: float
    selected_product_ids: List[str]
    is_active: bool
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime
