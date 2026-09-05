from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class VariationCreateRequest(BaseModel):
    color: str
    size: Optional[str] = None
    stock_quantity: int = 0
    images: List[str] = []  # GridFS file IDs or placeholder URLs
    video_url: Optional[str] = None
    is_default: bool = False


class VariationUpdateRequest(BaseModel):
    color: Optional[str] = None
    size: Optional[str] = None
    stock_quantity: Optional[int] = None
    images: Optional[List[str]] = None
    video_url: Optional[str] = None
    is_default: Optional[bool] = None


class VariationResponse(BaseModel):
    id: str
    product_id: str
    color: str
    size: Optional[str] = None
    stock_quantity: int
    images: List[str]
    video_url: Optional[str] = None
    is_default: bool


class ProductCreateRequest(BaseModel):
    name: str
    description: str = ""
    category_id: str
    actual_price: float
    discount_price: Optional[float] = None
    seo_keywords: List[str] = []
    variations: List[VariationCreateRequest] = []


class ProductUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    actual_price: Optional[float] = None
    discount_price: Optional[float] = None
    is_active: Optional[bool] = None
    seo_keywords: Optional[List[str]] = None


class ProductResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    category_id: str
    category_name: Optional[str] = None
    actual_price: float
    discount_price: Optional[float] = None
    is_active: bool
    seo_keywords: List[str]
    primary_image: Optional[str] = None
    secondary_image: Optional[str] = None
    average_rating: Optional[float] = None
    review_count: int = 0
    total_stock: int = 0
    created_at: datetime
    updated_at: datetime


class ProductDetailResponse(ProductResponse):
    variations: List[VariationResponse] = []


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    page_size: int
