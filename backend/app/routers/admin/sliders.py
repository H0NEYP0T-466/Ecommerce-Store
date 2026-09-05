from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status

from app.models.slider import Slider
from app.models.user import User
from app.schemas.slider import SliderCreateRequest, SliderUpdateRequest, SliderResponse
from app.utils.security import require_admin

router = APIRouter(prefix="/api/admin/sliders", tags=["Admin - Sliders"])


def slider_to_response(s: Slider) -> SliderResponse:
    return SliderResponse(
        id=str(s.id), image_url=s.image_url, title=s.title,
        subtitle=s.subtitle, link_url=s.link_url, is_active=s.is_active,
        display_order=s.display_order, created_at=s.created_at,
    )


@router.get("", response_model=list[SliderResponse])
async def list_sliders(admin: User = Depends(require_admin)):
    sliders = await Slider.find().sort("+display_order").to_list()
    return [slider_to_response(s) for s in sliders]


@router.post("", response_model=SliderResponse, status_code=status.HTTP_201_CREATED)
async def create_slider(data: SliderCreateRequest, admin: User = Depends(require_admin)):
    slider = Slider(**data.model_dump())
    await slider.insert()
    return slider_to_response(slider)


@router.put("/{slider_id}", response_model=SliderResponse)
async def update_slider(slider_id: str, data: SliderUpdateRequest, admin: User = Depends(require_admin)):
    slider = await Slider.get(slider_id)
    if not slider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slider not found")

    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(slider, key, value)

    slider.updated_at = datetime.utcnow()
    await slider.save()
    return slider_to_response(slider)


@router.delete("/{slider_id}")
async def delete_slider(slider_id: str, admin: User = Depends(require_admin)):
    slider = await Slider.get(slider_id)
    if not slider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slider not found")
    await slider.delete()
    return {"message": "Slider deleted"}
