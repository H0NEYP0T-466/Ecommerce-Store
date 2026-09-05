from datetime import datetime
from typing import Optional

from beanie import Document, Indexed
from pydantic import Field


class Category(Document):
    """Category document — supports parent-child hierarchy."""

    name: str
    slug: Indexed(str, unique=True)
    parent_id: Optional[str] = None  # ObjectId as string for subcategories
    is_active: bool = True
    display_order: int = 0

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "categories"
