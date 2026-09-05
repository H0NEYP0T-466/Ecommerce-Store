from fastapi import APIRouter

from app.models.settings import SiteSettings
from app.schemas.settings import SiteSettingsResponse

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("", response_model=SiteSettingsResponse)
async def get_settings():
    """Get public site settings."""
    settings = await SiteSettings.get_or_create()
    return SiteSettingsResponse(
        logo_url=settings.logo_url,
        display_name=settings.display_name,
        contact_info=settings.contact_info,
        whatsapp_number=settings.whatsapp_number,
        facebook_url=settings.facebook_url,
        instagram_url=settings.instagram_url,
        youtube_url=settings.youtube_url,
        payment_gateway_enabled=settings.payment_gateway_enabled,
    )
