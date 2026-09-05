from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ReviewCreateRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = ""


class ReviewResponse(BaseModel):
    id: str
    product_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    is_approved: bool
    is_hidden: bool
    admin_reply: Optional[str] = None
    replied_at: Optional[datetime] = None
    created_at: datetime


class ReviewListResponse(BaseModel):
    reviews: List[ReviewResponse]
    total: int
    page: int
    page_size: int


class ReviewReplyRequest(BaseModel):
    admin_reply: str


class ReviewAdminUpdateRequest(BaseModel):
    is_approved: Optional[bool] = None
    is_hidden: Optional[bool] = None
    admin_reply: Optional[str] = None
