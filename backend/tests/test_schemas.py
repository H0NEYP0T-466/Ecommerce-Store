import pytest
from pydantic import ValidationError
from app.schemas.auth import RegisterRequest, LoginRequest
from app.schemas.notification import NotificationResponse, NotificationListResponse
from app.models.notification import NotificationType
from datetime import datetime


def test_register_request_validation():
    """Valid register request succeeds."""
    req = RegisterRequest(
        email="test@example.com",
        password="securePassword123",
        first_name="Hamid",
        last_name="Ali",
        phone="+923001234567",
    )
    assert req.email == "test@example.com"
    assert req.first_name == "Hamid"


def test_invalid_email_fails_validation():
    """Invalid email raises ValidationError."""
    with pytest.raises(ValidationError):
        RegisterRequest(
            email="not-an-email",
            password="pass",
            first_name="A",
            last_name="B",
        )


def test_notification_schemas():
    """Test notification response serialization."""
    notif = NotificationResponse(
        id="notif_1",
        type=NotificationType.NEW_ORDER,
        entity_id="order_123",
        message="New order received",
        is_read=False,
        created_at=datetime.utcnow(),
    )
    assert notif.type == NotificationType.NEW_ORDER
    assert notif.is_read is False

    listing = NotificationListResponse(
        notifications=[notif],
        total=1,
        unread_count=1,
    )
    assert listing.unread_count == 1
