import pytest
from app.main import app
from app.utils.security import get_current_user
from app.models.user import User, UserRole


@pytest.mark.asyncio
async def test_admin_route_requires_auth(client):
    """Accessing admin endpoints without token returns 401."""
    # Ensure no dependency override is present
    app.dependency_overrides.pop(get_current_user, None)
    response = await client.get("/api/admin/users")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_customer_cannot_access_admin_route(client):
    """Customer role user attempting to access admin route receives 403 Forbidden."""
    async def mock_customer():
        return User.model_construct(
            email="customer@example.com",
            password_hash="hashed",
            first_name="Test",
            last_name="Customer",
            role=UserRole.CUSTOMER,
            is_active=True,
        )

    app.dependency_overrides[get_current_user] = mock_customer
    try:
        response = await client.get("/api/admin/users")
        assert response.status_code == 403
        data = response.json()
        assert data["detail"] == "Admin access required"
    finally:
        app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.asyncio
async def test_require_admin_allows_admin():
    """Admin role user is permitted by require_admin dependency."""
    from app.utils.security import require_admin
    admin_user = User.model_construct(
        email="admin@hamidcloth.com",
        password_hash="hashed",
        first_name="Hamid",
        last_name="Admin",
        role=UserRole.ADMIN,
        is_active=True,
    )
    result = await require_admin(user=admin_user)
    assert result.role == UserRole.ADMIN
    assert result.email == "admin@hamidcloth.com"

