from pydantic import BaseModel
from typing import Optional


class SiteSettingsResponse(BaseModel):
    logo_url: Optional[str] = None
    display_name: str
    contact_info: str
    whatsapp_number: str
    facebook_url: str
    instagram_url: str
    youtube_url: str
    payment_gateway_enabled: bool = False


class SiteSettingsUpdateRequest(BaseModel):
    logo_url: Optional[str] = None
    display_name: Optional[str] = None
    contact_info: Optional[str] = None
    whatsapp_number: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None
    payment_gateway_enabled: Optional[bool] = None
    payment_gateway_embed_code: Optional[str] = None
