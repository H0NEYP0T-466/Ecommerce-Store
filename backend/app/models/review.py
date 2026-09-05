from datetime import datetime
from typing import Optional

from beanie import Document, Indexed
from pydantic import Field


class Review(Document):
    """Product review document."""

    product_id: Indexed(str)
    user_id: str
    user_name: str  # Denormalized for display
    rating: int = Field(ge=1, le=5)
    comment: str = ""

    is_approved: bool = True
    is_hidden: bool = False

    admin_reply: Optional[str] = None
    replied_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reviews"
        indexes = ["is_approved"]
