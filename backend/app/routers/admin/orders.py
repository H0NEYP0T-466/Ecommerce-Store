from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.models.order import Order, OrderStatus, PaymentStatus, StatusHistoryEntry
from app.models.user import User
from app.schemas.order import (
    OrderResponse,
    OrderListResponse,
    OrderItemResponse,
    StatusHistoryResponse,
    OrderStatusUpdateRequest,
)
from app.utils.security import require_admin

router = APIRouter(prefix="/api/admin/orders", tags=["Admin - Orders"])


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


@router.get("", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    payment_status: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    admin: User = Depends(require_admin),
):
    """Admin list all orders with filters."""
    filter_conditions = []

    if status_filter:
        filter_conditions.append({"status": status_filter})
    if payment_status:
        filter_conditions.append({"payment_status": payment_status})
    if search:
        filter_conditions.append({
            "$or": [
                {"order_number": {"$regex": search, "$options": "i"}},
                {"customer_name": {"$regex": search, "$options": "i"}},
                {"customer_email": {"$regex": search, "$options": "i"}},
            ]
        })
    if date_from:
        filter_conditions.append({"created_at": {"$gte": datetime.fromisoformat(date_from)}})
    if date_to:
        filter_conditions.append({"created_at": {"$lte": datetime.fromisoformat(date_to)}})

    mongo_filter = {"$and": filter_conditions} if filter_conditions else {}

    total = await Order.find(mongo_filter).count()
    orders = await Order.find(mongo_filter).sort("-created_at").skip(
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
    admin: User = Depends(require_admin),
):
    """Admin get order detail."""
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order_to_response(order)


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    data: OrderStatusUpdateRequest,
    admin: User = Depends(require_admin),
):
    """Update order status with notes. Logs in status_history."""
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Validate status transition
    valid_statuses = [s.value for s in OrderStatus]
    if data.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}",
        )

    new_status = OrderStatus(data.status)

    # Log status change
    order.status_history.append(StatusHistoryEntry(
        status=new_status,
        changed_by=str(admin.id),
        notes=data.notes,
    ))
    order.status = new_status
    order.updated_at = datetime.utcnow()
    await order.save()

    return order_to_response(order)


@router.put("/{order_id}/payment", response_model=OrderResponse)
async def update_payment_status(
    order_id: str,
    payment_status: str = Query(...),
    admin: User = Depends(require_admin),
):
    """Admin marks order payment as paid or refunded."""
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    valid = [s.value for s in PaymentStatus]
    if payment_status not in valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid payment status. Must be one of: {valid}",
        )

    order.payment_status = PaymentStatus(payment_status)
    order.updated_at = datetime.utcnow()
    await order.save()

    return order_to_response(order)
