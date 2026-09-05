from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.category import Category
from app.models.user import User
from app.schemas.report import (
    OrderReportResponse,
    ProductReportResponse,
    ProductRankItem,
    FinanceReportResponse,
)
from app.utils.security import require_admin

router = APIRouter(prefix="/api/admin/reports", tags=["Admin - Reports"])


@router.get("/orders", response_model=OrderReportResponse)
async def order_report(
    admin: User = Depends(require_admin),
):
    """Order report — this month, last month, total counts."""
    now = datetime.utcnow()
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)

    this_month_count = await Order.find(
        Order.created_at >= this_month_start
    ).count()

    last_month_count = await Order.find(
        Order.created_at >= last_month_start,
        Order.created_at < this_month_start,
    ).count()

    total_count = await Order.find().count()

    recent_orders = await Order.find().sort("-created_at").limit(10).to_list()
    recent = [
        {
            "id": str(o.id),
            "order_number": o.order_number,
            "customer_name": o.customer_name,
            "total_amount": o.total_amount,
            "status": o.status.value,
            "created_at": o.created_at.isoformat(),
        } for o in recent_orders
    ]

    return OrderReportResponse(
        this_month_count=this_month_count,
        last_month_count=last_month_count,
        total_count=total_count,
        recent_orders=recent,
    )


@router.get("/products", response_model=ProductReportResponse)
async def product_report(
    period: str = Query("all_time", regex="^(this_month|all_time)$"),
    category_id: Optional[str] = None,
    admin: User = Depends(require_admin),
):
    """Product report — ranked by sales."""
    now = datetime.utcnow()

    # Get orders in period
    filter_conditions = {}
    if period == "this_month":
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        filter_conditions["created_at"] = {"$gte": month_start}

    orders = await Order.find(filter_conditions).to_list()

    # Aggregate sales per product
    product_sales = {}  # product_name -> {units, revenue}
    for order in orders:
        for item in order.items:
            key = item.product_name
            if key not in product_sales:
                product_sales[key] = {"units": 0, "revenue": 0.0, "variation_id": item.product_variation_id}
            product_sales[key]["units"] += item.quantity
            product_sales[key]["revenue"] += item.subtotal

    # Sort by revenue
    ranked = sorted(product_sales.items(), key=lambda x: x[1]["revenue"], reverse=True)

    items = []
    for rank, (name, data) in enumerate(ranked[:50], 1):
        items.append(ProductRankItem(
            rank=rank,
            product_id=data["variation_id"],
            product_name=name,
            units_sold=data["units"],
            revenue=data["revenue"],
        ))

    return ProductReportResponse(products=items, period=period)


@router.get("/finance", response_model=FinanceReportResponse)
async def finance_report(
    admin: User = Depends(require_admin),
):
    """Finance report — total revenue, average order value, top products."""
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    all_orders = await Order.find().to_list()
    this_month_orders = [o for o in all_orders if o.created_at >= month_start]

    total_revenue = sum(o.total_amount for o in all_orders)
    total_orders = len(all_orders)
    average_order_value = total_revenue / total_orders if total_orders > 0 else 0

    this_month_revenue = sum(o.total_amount for o in this_month_orders)
    this_month_count = len(this_month_orders)

    # Top products by revenue
    product_revenue = {}
    for order in all_orders:
        for item in order.items:
            if item.product_name not in product_revenue:
                product_revenue[item.product_name] = {"units": 0, "revenue": 0.0, "vid": item.product_variation_id}
            product_revenue[item.product_name]["units"] += item.quantity
            product_revenue[item.product_name]["revenue"] += item.subtotal

    top_sorted = sorted(product_revenue.items(), key=lambda x: x[1]["revenue"], reverse=True)[:10]
    top_products = [
        ProductRankItem(
            rank=i+1, product_id=data["vid"], product_name=name,
            units_sold=data["units"], revenue=data["revenue"],
        ) for i, (name, data) in enumerate(top_sorted)
    ]

    return FinanceReportResponse(
        total_revenue=total_revenue,
        total_orders=total_orders,
        average_order_value=round(average_order_value, 2),
        this_month_revenue=this_month_revenue,
        this_month_orders=this_month_count,
        top_products=top_products,
    )
