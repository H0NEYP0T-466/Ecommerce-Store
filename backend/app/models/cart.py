from datetime import datetime
from typing import List

from beanie import Document, Indexed
from pydantic import Field, BaseModel


class CartItem(BaseModel):
    """Embedded cart item."""

    product_variation_id: str
    quantity: int = 1


class Cart(Document):
    """Shopping cart document — one per user."""

    user_id: Indexed(str, unique=True)
    items: List[CartItem] = Field(default_factory=list)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "carts"
