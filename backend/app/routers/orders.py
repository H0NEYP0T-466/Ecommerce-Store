from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status

from app.models.cart import Cart
from app.models.order import Order, OrderStatus, PaymentStatus, StatusHistoryEntry
from app.models.user import User
from app.schemas.order import (
    OrderCreateRequest,
    OrderResponse,
    OrderListResponse,
    OrderItemResponse,
    StatusHistoryResponse,
    PaymentProofUploadResponse,
)
from app.utils.security import get_current_user
from app.services.order_service import create_order_from_cart
from app.services import image_service
from app.services.notification_service import create_notification
from app.models.notification import NotificationType

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def order_to_response(order: Order) -> OrderResponse:
    return OrderResponse(
        id=str(order.id),
        order_number=order.order_number,
        user_id=order.user_id,
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone,
        customer_address=order.customer_address,
        items=[
            OrderItemResponse(
                product_variation_id=item.product_variation_id,
                product_name=item.product_name,
                color=item.color,
                size=item.size,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
            ) for item in order.items
        ],
        total_amount=order.total_amount,
        payment_method=order.payment_method,
        payment_status=order.payment_status.value,
        payment_proof_url=order.payment_proof_url,
        transaction_id=order.transaction_id,
        status=order.status.value,
        status_history=[
            StatusHistoryResponse(
                status=sh.status.value,
                changed_by=sh.changed_by,
                changed_at=sh.changed_at,
                notes=sh.notes,
            ) for sh in order.status_history
        ],
        additional_notes=order.additional_notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def place_order(
    data: OrderCreateRequest,
    user: User = Depends(get_current_user),
):
    """Place an order from the current user's cart."""
    cart = await Cart.find_one(Cart.user_id == str(user.id))
    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    try:
        order = await create_order_from_cart(
            cart=cart,
            customer_name=data.customer_name,
            customer_email=data.customer_email,
            customer_phone=data.customer_phone,
            customer_address=data.customer_address,
            payment_method=data.payment_method,
            transaction_id=data.transaction_id,
            additional_notes=data.additional_notes,
            user_id=str(user.id),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return order_to_response(order)


@router.get("", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
):
    """Get current user's order history."""
    query = Order.find(Order.user_id == str(user.id))
    total = await query.count()
    orders = await query.sort("-created_at").skip(
        (page - 1) * page_size
    ).limit(page_size).to_list()

    return OrderListResponse(
        orders=[order_to_response(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    user: User = Depends(get_current_user),
):
    """Get a specific order detail."""
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Users can only view their own orders
    if order.user_id != str(user.id) and user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return order_to_response(order)


@router.post("/{order_id}/upload-proof", response_model=PaymentProofUploadResponse)
async def upload_payment_proof(
    order_id: str,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    """Upload payment proof screenshot for an order."""
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.user_id != str(user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    try:
        file_id = await image_service.upload_image(file, f"payment_proof_{order.order_number}")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    order.payment_proof_url = file_id
    order.updated_at = datetime.utcnow()
    await order.save()

    # Notify admin
    await create_notification(
        NotificationType.PAYMENT_RECEIVED,
        str(order.id),
        f"Payment proof uploaded for order {order.order_number}",
    )

    return PaymentProofUploadResponse(
        message="Payment proof uploaded successfully",
        payment_proof_url=file_id,
    )
