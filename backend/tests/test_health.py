import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    """Test the /api/health monitoring endpoint."""
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "app" in data
    assert "port" in data
