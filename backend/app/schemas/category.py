from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CategoryCreateRequest(BaseModel):
    name: str
    parent_id: Optional[str] = None
    display_order: int = 0


class CategoryUpdateRequest(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    parent_id: Optional[str] = None
    is_active: bool
    display_order: int
    children: List["CategoryResponse"] = []


class CategoryListResponse(BaseModel):
    categories: List[CategoryResponse]
