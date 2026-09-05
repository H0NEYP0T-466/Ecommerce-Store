from datetime import datetime
from typing import Optional

from beanie import Document
from pydantic import Field


class Slider(Document):
    """Hero slider image document."""

    image_url: str  # GridFS file ID or placeholder URL
    title: Optional[str] = None
    subtitle: Optional[str] = None
    link_url: Optional[str] = None  # Product or category link
    is_active: bool = True
    display_order: int = 0

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "sliders"
