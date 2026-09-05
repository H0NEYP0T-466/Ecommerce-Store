from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.models.review import Review
from app.models.product import Product
from app.models.user import User
from app.schemas.review import ReviewCreateRequest, ReviewResponse, ReviewListResponse
from app.utils.security import get_current_user
from app.services.notification_service import create_notification
from app.models.notification import NotificationType

router = APIRouter(prefix="/api/products", tags=["Reviews"])


@router.get("/{product_id}/reviews", response_model=ReviewListResponse)
async def get_product_reviews(
    product_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """Get approved reviews for a product."""
    query = Review.find(
        Review.product_id == product_id,
        Review.is_approved == True,
        Review.is_hidden == False,
    )
    total = await query.count()
    reviews = await query.sort("-created_at").skip(
        (page - 1) * page_size
    ).limit(page_size).to_list()

    return ReviewListResponse(
        reviews=[
            ReviewResponse(
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
            ) for r in reviews
        ],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/{product_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    product_id: str,
    data: ReviewCreateRequest,
    user: User = Depends(get_current_user),
):
    """Create a review for a product."""
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    review = Review(
        product_id=product_id,
        user_id=str(user.id),
        user_name=user.full_name,
        rating=data.rating,
        comment=data.comment,
    )
    await review.insert()

    # Notify admin
    await create_notification(
        NotificationType.NEW_REVIEW,
        str(review.id),
        f"New {data.rating}-star review on {product.name} by {user.full_name}",
    )

    return ReviewResponse(
        id=str(review.id),
        product_id=review.product_id,
        user_id=review.user_id,
        user_name=review.user_name,
        rating=review.rating,
        comment=review.comment,
        is_approved=review.is_approved,
        is_hidden=review.is_hidden,
        admin_reply=review.admin_reply,
        replied_at=review.replied_at,
        created_at=review.created_at,
    )
