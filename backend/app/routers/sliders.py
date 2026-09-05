from fastapi import APIRouter

from app.models.slider import Slider
from app.schemas.slider import SliderResponse

router = APIRouter(prefix="/api/sliders", tags=["Sliders"])


@router.get("", response_model=list[SliderResponse])
async def get_sliders():
    """Get active sliders ordered by display_order."""
    sliders = await Slider.find(Slider.is_active == True).sort("+display_order").to_list()
    return [
        SliderResponse(
            id=str(s.id),
            image_url=s.image_url,
            title=s.title,
            subtitle=s.subtitle,
            link_url=s.link_url,
            is_active=s.is_active,
            display_order=s.display_order,
            created_at=s.created_at,
        ) for s in sliders
    ]
