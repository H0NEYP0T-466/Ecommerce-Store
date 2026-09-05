from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.models.review import Review
from app.models.user import User
from app.schemas.review import (
    ReviewResponse,
    ReviewListResponse,
    ReviewReplyRequest,
    ReviewAdminUpdateRequest,
)
from app.utils.security import require_admin

router = APIRouter(prefix="/api/admin/reviews", tags=["Admin - Reviews"])


def review_to_response(r: Review) -> ReviewResponse:
    return ReviewResponse(
        id=str(r.id),
        product_id=r.product_id,
        user_id=r.user_id,
        user_name=r.user_name,
        rating=r.rating,
        comment=r.comment,
        is_approved=r.is_approved,
        is_hidden=r.is_hidden,
        admin_reply=r.admin_reply,
        replied_at=r.replied_at,
        created_at=r.created_at,
    )


@router.get("", response_model=ReviewListResponse)
async def list_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    product_id: Optional[str] = None,
    rating: Optional[int] = None,
    is_hidden: Optional[bool] = None,
    search: Optional[str] = None,
    admin: User = Depends(require_admin),
):
    """Admin list all reviews with filters."""
    filter_conditions = []

    if product_id:
        filter_conditions.append({"product_id": product_id})
    if rating:
        filter_conditions.append({"rating": rating})
    if is_hidden is not None:
        filter_conditions.append({"is_hidden": is_hidden})
    if search:
        filter_conditions.append({
            "$or": [
                {"user_name": {"$regex": search, "$options": "i"}},
                {"comment": {"$regex": search, "$options": "i"}},
            ]
        })

    mongo_filter = {"$and": filter_conditions} if filter_conditions else {}

    total = await Review.find(mongo_filter).count()
    reviews = await Review.find(mongo_filter).sort("-created_at").skip(
        (page - 1) * page_size
    ).limit(page_size).to_list()

    return ReviewListResponse(
        reviews=[review_to_response(r) for r in reviews],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    data: ReviewAdminUpdateRequest,
    admin: User = Depends(require_admin),
):
    """Admin update review (approve, hide, reply)."""
    review = await Review.get(review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    if data.is_approved is not None:
        review.is_approved = data.is_approved
    if data.is_hidden is not None:
        review.is_hidden = data.is_hidden
    if data.admin_reply is not None:
        review.admin_reply = data.admin_reply
        review.replied_at = datetime.utcnow()

    review.updated_at = datetime.utcnow()
    await review.save()
    return review_to_response(review)


@router.post("/{review_id}/reply", response_model=ReviewResponse)
async def reply_to_review(
    review_id: str,
    data: ReviewReplyRequest,
    admin: User = Depends(require_admin),
):
    """Admin reply to a review."""
    review = await Review.get(review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    review.admin_reply = data.admin_reply
    review.replied_at = datetime.utcnow()
    review.updated_at = datetime.utcnow()
    await review.save()
    return review_to_response(review)


@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    admin: User = Depends(require_admin),
):
    """Admin permanently delete a review."""
    review = await Review.get(review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    await review.delete()
    return {"message": "Review deleted"}
