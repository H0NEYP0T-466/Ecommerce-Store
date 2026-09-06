from app.models.user import User, UserRole
from app.models.order import OrderStatus, PaymentStatus
from app.models.notification import NotificationType


def test_user_roles():
    """Test user role enumeration values."""
    assert UserRole.ADMIN == "admin"
    assert UserRole.CUSTOMER == "customer"


def test_order_statuses():
    """Test order status enumeration sequence."""
    statuses = [OrderStatus.RECEIVED, OrderStatus.PACKING, OrderStatus.DISPATCHED, OrderStatus.DELIVERED]
    assert [s.value for s in statuses] == ["received", "packing", "dispatched", "delivered"]


def test_payment_statuses():
    """Test payment status enumeration values."""
    assert PaymentStatus.PENDING == "pending"
    assert PaymentStatus.PAID == "paid"
    assert PaymentStatus.REFUNDED == "refunded"


def test_notification_types():
    """Test notification type enumeration values."""
    assert NotificationType.NEW_ORDER == "new_order"
    assert NotificationType.NEW_REVIEW == "new_review"
    assert NotificationType.LOW_STOCK == "low_stock"
    assert NotificationType.PAYMENT_RECEIVED == "payment_received"
