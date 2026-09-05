from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SliderCreateRequest(BaseModel):
    image_url: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    link_url: Optional[str] = None
    is_active: bool = True
    display_order: int = 0


class SliderUpdateRequest(BaseModel):
    image_url: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    link_url: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class SliderResponse(BaseModel):
    id: str
    image_url: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    link_url: Optional[str] = None
    is_active: bool
    display_order: int
    created_at: datetime
