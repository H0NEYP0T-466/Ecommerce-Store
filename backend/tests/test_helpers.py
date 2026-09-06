from app.utils.helpers import generate_slug


def test_generate_slug():
    """Test slug creation from product/category names."""
    title = "Men's Luxury Cotton Kurta - Special Edition!"
    slug = generate_slug(title)

    assert "cotton-kurta" in slug
    assert "!" not in slug
    assert "'" not in slug
    assert " " not in slug


def test_generate_slug_urdu_or_mixed():
    """Test slug creation with special characters."""
    title = "Shalwar Kameez (Dark Navy / Large)"
    slug = generate_slug(title)

    assert "shalwar-kameez" in slug
    assert "/" not in slug
    assert "(" not in slug
