from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status

from app.models.cart import Cart, CartItem
from app.models.product import Product, ProductVariation
from app.models.user import User
from app.schemas.cart import (
    CartItemRequest,
    CartItemUpdateRequest,
    CartItemResponse,
    CartResponse,
)
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/cart", tags=["Cart"])


async def get_or_create_cart(user: User) -> Cart:
    """Get or create a cart for the user."""
    cart = await Cart.find_one(Cart.user_id == str(user.id))
    if not cart:
        cart = Cart(user_id=str(user.id))
        await cart.insert()
    return cart


async def enrich_cart(cart: Cart) -> CartResponse:
    """Enrich cart items with product details."""
    enriched_items = []
    total = 0.0

    for item in cart.items:
        variation = await ProductVariation.get(item.product_variation_id)
        if not variation:
            continue

        try:
            product = await Product.get(variation.product_id)
        except Exception:
            product = None

        if not product:
            continue

        unit_price = product.discount_price if product.discount_price and product.discount_price < product.actual_price else product.actual_price
        subtotal = unit_price * item.quantity

        enriched_items.append(CartItemResponse(
            product_variation_id=item.product_variation_id,
            product_name=product.name,
            color=variation.color,
            size=variation.size,
            quantity=item.quantity,
            unit_price=unit_price,
            subtotal=subtotal,
            image=variation.images[0] if variation.images else None,
            stock_available=variation.stock_quantity,
        ))
        total += subtotal

    return CartResponse(
        items=enriched_items,
        total=total,
        item_count=len(enriched_items),
    )


@router.get("", response_model=CartResponse)
async def get_cart(user: User = Depends(get_current_user)):
    """Get current user's cart."""
    cart = await get_or_create_cart(user)
    return await enrich_cart(cart)


@router.post("/items", response_model=CartResponse)
async def add_to_cart(
    data: CartItemRequest,
    user: User = Depends(get_current_user),
):
    """Add item to cart. Merges quantity if item already exists."""
    # Validate variation exists
    variation = await ProductVariation.get(data.product_variation_id)
    if not variation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product variation not found")

    # Check stock
    if data.quantity > variation.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Available: {variation.stock_quantity}",
        )

    cart = await get_or_create_cart(user)

    # Check if item already in cart
    existing_idx = None
    for i, item in enumerate(cart.items):
        if item.product_variation_id == data.product_variation_id:
            existing_idx = i
            break

    if existing_idx is not None:
        new_qty = cart.items[existing_idx].quantity + data.quantity
        if new_qty > variation.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock. Available: {variation.stock_quantity}, in cart: {cart.items[existing_idx].quantity}",
            )
        cart.items[existing_idx].quantity = new_qty
    else:
        cart.items.append(CartItem(
            product_variation_id=data.product_variation_id,
            quantity=data.quantity,
        ))

    cart.updated_at = datetime.utcnow()
    await cart.save()
    return await enrich_cart(cart)


@router.put("/items/{product_variation_id}", response_model=CartResponse)
async def update_cart_item(
    product_variation_id: str,
    data: CartItemUpdateRequest,
    user: User = Depends(get_current_user),
):
    """Update quantity of a cart item."""
    cart = await get_or_create_cart(user)

    found = False
    for i, item in enumerate(cart.items):
        if item.product_variation_id == product_variation_id:
            if data.quantity <= 0:
                cart.items.pop(i)
            else:
                # Check stock
                variation = await ProductVariation.get(product_variation_id)
                if variation and data.quantity > variation.stock_quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Insufficient stock. Available: {variation.stock_quantity}",
                    )
                cart.items[i].quantity = data.quantity
            found = True
            break

    if not found:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in cart")

    cart.updated_at = datetime.utcnow()
    await cart.save()
    return await enrich_cart(cart)


@router.delete("/items/{product_variation_id}", response_model=CartResponse)
async def remove_cart_item(
    product_variation_id: str,
    user: User = Depends(get_current_user),
):
    """Remove an item from cart."""
    cart = await get_or_create_cart(user)

    cart.items = [i for i in cart.items if i.product_variation_id != product_variation_id]
    cart.updated_at = datetime.utcnow()
    await cart.save()

    return await enrich_cart(cart)


@router.delete("", response_model=CartResponse)
async def clear_cart(user: User = Depends(get_current_user)):
    """Clear entire cart."""
    cart = await get_or_create_cart(user)
    cart.items = []
    cart.updated_at = datetime.utcnow()
    await cart.save()
    return await enrich_cart(cart)
