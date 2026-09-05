from datetime import datetime
from typing import Optional, List

from beanie import Document
from pydantic import Field


class Promotion(Document):
    """Promotion / sale document."""

    title: str
    description: str = ""
    discount_percent: float = Field(ge=0, le=100)
    selected_product_ids: List[str] = Field(default_factory=list)
    is_active: bool = False
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "promotions"
