from fastapi import APIRouter

from app.models.promotion import Promotion
from app.schemas.promotion import PromotionResponse

router = APIRouter(prefix="/api/promotions", tags=["Promotions"])


@router.get("", response_model=list[PromotionResponse])
async def get_promotions():
    """Get active promotions."""
    promotions = await Promotion.find(Promotion.is_active == True).sort("-created_at").to_list()
    return [
        PromotionResponse(
            id=str(p.id), title=p.title, description=p.description,
            discount_percent=p.discount_percent, selected_product_ids=p.selected_product_ids,
            is_active=p.is_active, start_date=p.start_date, end_date=p.end_date,
            created_at=p.created_at,
        ) for p in promotions
    ]
