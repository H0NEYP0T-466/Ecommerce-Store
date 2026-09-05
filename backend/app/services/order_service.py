from datetime import datetime

from app.database import get_db
from app.models.order import Order, OrderItem, OrderCounter, OrderStatus, StatusHistoryEntry
from app.models.product import Product, ProductVariation
from app.models.cart import Cart
from app.models.notification import NotificationType
from app.services.notification_service import create_notification


async def generate_order_number() -> str:
    """Generate a unique order number: HC-YYYYMMDD-XXXX.
    
    Uses atomic $inc on a daily counter document for thread safety.
    """
    today = datetime.utcnow().strftime("%Y%m%d")

    db = get_db()
    result = await db["order_counters"].find_one_and_update(
        {"date_key": today},
        {"$inc": {"counter": 1}},
        upsert=True,
        return_document=True,
    )

    counter = result["counter"]
    return f"HC-{today}-{counter:04d}"


async def create_order_from_cart(
    cart: Cart,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    customer_address: str,
    payment_method: str = None,
    transaction_id: str = None,
    additional_notes: str = None,
    user_id: str = None,
) -> Order:
    """Create an order from cart items with price snapshots and stock decrements.
    
    This is the core checkout logic:
    1. Validate all items are in stock
    2. Snapshot current prices into order items
    3. Atomically decrement stock
    4. Generate order number
    5. Create order
    6. Clear cart
    7. Send notification
    """
    if not cart.items:
        raise ValueError("Cart is empty")

    order_items = []
    total_amount = 0.0

    # Phase 1: Validate stock and build order items (price snapshot)
    for cart_item in cart.items:
        variation = await ProductVariation.get(cart_item.product_variation_id)
        if not variation:
            raise ValueError(f"Product variation {cart_item.product_variation_id} not found")

        if variation.stock_quantity < cart_item.quantity:
            raise ValueError(
                f"Insufficient stock for variation {variation.color}. "
                f"Available: {variation.stock_quantity}, requested: {cart_item.quantity}"
            )

        product = await Product.get(variation.product_id)
        if not product:
            raise ValueError(f"Product not found for variation {cart_item.product_variation_id}")

        # Snapshot price at time of order
        unit_price = product.discount_price if product.discount_price and product.discount_price < product.actual_price else product.actual_price
        subtotal = unit_price * cart_item.quantity

        order_items.append(OrderItem(
            product_variation_id=cart_item.product_variation_id,
            product_name=product.name,
            color=variation.color,
            size=variation.size,
            quantity=cart_item.quantity,
            unit_price=unit_price,
            subtotal=subtotal,
        ))
        total_amount += subtotal

    # Phase 2: Decrement stock atomically
    db = get_db()
    for cart_item in cart.items:
        result = await db["product_variations"].update_one(
            {
                "_id": cart_item.product_variation_id,
                "stock_quantity": {"$gte": cart_item.quantity},
            },
            {"$inc": {"stock_quantity": -cart_item.quantity}},
        )
        # If update didn't match, someone else took the stock (concurrent order)
        # For ObjectId fields, we need to handle the ID type properly
        from bson import ObjectId
        if result.modified_count == 0:
            result = await db["product_variations"].update_one(
                {
                    "_id": ObjectId(cart_item.product_variation_id),
                    "stock_quantity": {"$gte": cart_item.quantity},
                },
                {"$inc": {"stock_quantity": -cart_item.quantity}},
            )
            if result.modified_count == 0:
                raise ValueError(f"Stock race condition. Please try again.")

    # Phase 3: Generate order number and create order
    order_number = await generate_order_number()

    order = Order(
        order_number=order_number,
        user_id=user_id or str(cart.user_id),
        customer_name=customer_name,
        customer_email=customer_email,
        customer_phone=customer_phone,
        customer_address=customer_address,
        items=order_items,
        total_amount=total_amount,
        payment_method=payment_method,
        transaction_id=transaction_id,
        additional_notes=additional_notes,
        status_history=[
            StatusHistoryEntry(
                status=OrderStatus.RECEIVED,
                changed_by="system",
                notes="Order placed",
            )
        ],
    )
    await order.insert()

    # Phase 4: Clear cart
    cart.items = []
    cart.updated_at = datetime.utcnow()
    await cart.save()

    # Phase 5: Check for low stock and notify
    for cart_item in cart.items:
        variation = await ProductVariation.get(cart_item.product_variation_id)
        if variation and variation.stock_quantity <= 5:
            product = await Product.get(variation.product_id)
            await create_notification(
                NotificationType.LOW_STOCK,
                str(variation.id),
                f"Low stock alert: {product.name if product else 'Unknown'} ({variation.color}) — {variation.stock_quantity} remaining",
            )

    # Send new order notification
    await create_notification(
        NotificationType.NEW_ORDER,
        str(order.id),
        f"New order {order_number} from {customer_name} — Rs. {total_amount:,.0f}",
    )

    return order
