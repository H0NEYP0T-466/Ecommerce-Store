import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.utils.security import create_access_token
from app.models.user import UserRole


@pytest.fixture
async def client():
    """Async HTTP test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


@pytest.fixture
def admin_token():
    """Valid JWT token with admin role."""
    return create_access_token(user_id="60d5ec49f1b2c8b1f8e4e1a1", role=UserRole.ADMIN)


@pytest.fixture
def customer_token():
    """Valid JWT token with customer role."""
    return create_access_token(user_id="60d5ec49f1b2c8b1f8e4e1a2", role=UserRole.CUSTOMER)


@pytest.fixture
def admin_headers(admin_token):
    """Authorization headers for admin requests."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def customer_headers(customer_token):
    """Authorization headers for customer requests."""
    return {"Authorization": f"Bearer {customer_token}"}
