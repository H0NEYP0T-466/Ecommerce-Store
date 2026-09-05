from datetime import datetime
from typing import Optional

from beanie import Document
from pydantic import Field


class SiteSettings(Document):
    """Singleton document for site-wide settings.
    
    Only one document should exist. Use get_or_create() to access.
    """

    logo_url: Optional[str] = None  # GridFS file ID or URL
    display_name: str = "Hamid Cloth House"
    contact_info: str = ""
    whatsapp_number: str = ""
    facebook_url: str = ""
    instagram_url: str = ""
    youtube_url: str = ""

    # Payment gateway placeholder
    payment_gateway_enabled: bool = False
    payment_gateway_embed_code: str = ""

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "site_settings"

    @classmethod
    async def get_or_create(cls) -> "SiteSettings":
        """Get the singleton settings document, creating default if not exists."""
        doc = await cls.find_one()
        if not doc:
            doc = cls()
            await doc.insert()
        return doc
