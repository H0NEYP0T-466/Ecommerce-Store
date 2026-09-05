from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CartItemRequest(BaseModel):
    product_variation_id: str
    quantity: int = 1


class CartItemUpdateRequest(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    product_variation_id: str
    product_name: str
    color: str
    size: Optional[str] = None
    quantity: int
    unit_price: float
    subtotal: float
    image: Optional[str] = None
    stock_available: int


class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total: float
    item_count: int
