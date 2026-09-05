from datetime import datetime
from typing import Optional, List

from beanie import Document, Indexed
from pydantic import Field


class ProductVariation(Document):
    """Product variation — different colors/sizes of a product."""

    product_id: Indexed(str)  # Reference to Product
    color: Indexed(str)
    size: Optional[str] = None  # e.g., "S", "M", "L", "XL"
    stock_quantity: int = 0
    images: List[str] = Field(default_factory=list)  # GridFS file IDs or placeholder URLs
    video_url: Optional[str] = None  # YouTube link
    is_default: bool = False

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "product_variations"


class Product(Document):
    """Product document — main product info."""

    name: str
    slug: Indexed(str, unique=True)
    description: str = ""
    category_id: Indexed(str)  # Reference to Category
    actual_price: float
    discount_price: Optional[float] = None
    is_active: bool = True
    seo_keywords: List[str] = Field(default_factory=list)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "products"

    @property
    def has_discount(self) -> bool:
        return self.discount_price is not None and self.discount_price < self.actual_price

    @property
    def effective_price(self) -> float:
        if self.has_discount:
            return self.discount_price
        return self.actual_price
