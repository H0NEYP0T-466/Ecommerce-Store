import pytest
from app.schemas.cart import CartItemRequest, CartItemUpdateRequest, CartItemResponse, CartResponse


def test_cart_item_request():
    req = CartItemRequest(product_variation_id="var123", quantity=2)
    assert req.product_variation_id == "var123"
    assert req.quantity == 2


def test_cart_item_update_request():
    req = CartItemUpdateRequest(quantity=5)
    assert req.quantity == 5


def test_cart_response():
    item = CartItemResponse(
        product_variation_id="var123",
        product_name="Classic Kurta",
        color="White",
        size="M",
        quantity=2,
        unit_price=1500.0,
        subtotal=3000.0,
        stock_available=10,
    )
    cart = CartResponse(
        items=[item],
        total=3000.0,
        item_count=1,
    )
    assert cart.total == 3000.0
    assert cart.item_count == 1
    assert cart.items[0].product_name == "Classic Kurta"
