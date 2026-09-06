import pytest
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.user import UserRole


def test_password_hashing():
    """Test bcrypt password hashing and verification."""
    password = "secretPassword123"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongPassword", hashed) is False


def test_access_token_creation_and_decoding():
    """Test JWT creation and payload decoding."""
    user_id = "user_12345"
    role = UserRole.ADMIN

    token = create_access_token(user_id=user_id, role=role)
    assert isinstance(token, str)

    payload = decode_token(token)
    assert payload["sub"] == user_id
    assert payload["role"] == role.value
    assert payload["type"] == "access"
    assert "exp" in payload


def test_refresh_token_creation():
    """Test refresh token payload generation."""
    user_id = "user_54321"
    token = create_refresh_token(user_id=user_id)

    payload = decode_token(token)
    assert payload["sub"] == user_id
    assert payload["type"] == "refresh"
