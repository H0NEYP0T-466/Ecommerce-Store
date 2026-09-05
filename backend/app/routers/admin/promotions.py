from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status

from app.models.promotion import Promotion
from app.models.user import User
from app.schemas.promotion import PromotionCreateRequest, PromotionUpdateRequest, PromotionResponse
from app.utils.security import require_admin

router = APIRouter(prefix="/api/admin/promotions", tags=["Admin - Promotions"])


def promo_to_response(p: Promotion) -> PromotionResponse:
    return PromotionResponse(
        id=str(p.id), title=p.title, description=p.description,
        discount_percent=p.discount_percent, selected_product_ids=p.selected_product_ids,
        is_active=p.is_active, start_date=p.start_date, end_date=p.end_date,
        created_at=p.created_at,
    )


@router.get("", response_model=list[PromotionResponse])
async def list_promotions(admin: User = Depends(require_admin)):
    promotions = await Promotion.find().sort("-created_at").to_list()
    return [promo_to_response(p) for p in promotions]


@router.post("", response_model=PromotionResponse, status_code=status.HTTP_201_CREATED)
async def create_promotion(data: PromotionCreateRequest, admin: User = Depends(require_admin)):
    promotion = Promotion(**data.model_dump())
    await promotion.insert()
    return promo_to_response(promotion)


@router.put("/{promo_id}", response_model=PromotionResponse)
async def update_promotion(promo_id: str, data: PromotionUpdateRequest, admin: User = Depends(require_admin)):
    promo = await Promotion.get(promo_id)
    if not promo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found")

    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(promo, key, value)

    promo.updated_at = datetime.utcnow()
    await promo.save()
    return promo_to_response(promo)


@router.delete("/{promo_id}")
async def delete_promotion(promo_id: str, admin: User = Depends(require_admin)):
    promo = await Promotion.get(promo_id)
    if not promo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promotion not found")
    await promo.delete()
    return {"message": "Promotion deleted"}
