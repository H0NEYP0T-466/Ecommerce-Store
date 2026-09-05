from datetime import datetime

from fastapi import APIRouter, Depends, status

from app.models.settings import SiteSettings
from app.models.user import User
from app.schemas.settings import SiteSettingsResponse, SiteSettingsUpdateRequest
from app.utils.security import require_admin

router = APIRouter(prefix="/api/admin/settings", tags=["Admin - Settings"])


@router.get("", response_model=SiteSettingsResponse)
async def get_settings(admin: User = Depends(require_admin)):
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


@router.put("", response_model=SiteSettingsResponse)
async def update_settings(
    data: SiteSettingsUpdateRequest,
    admin: User = Depends(require_admin),
):
    settings = await SiteSettings.get_or_create()

    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(settings, key, value)

    settings.updated_at = datetime.utcnow()
    await settings.save()

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
