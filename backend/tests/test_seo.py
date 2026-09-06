import pytest
from app.services.seo_service import generate_seo_keywords


def test_seo_keyword_generation():
    """Test SEO service generates relevant Pakistani fashion keywords."""
    keywords = generate_seo_keywords(
        product_name="Men's Embroidered Kurta",
        category_name="Men's Clothing",
        description="Premium cotton embroidered kurta suitable for weddings and Eid events.",
    )

    assert isinstance(keywords, list)
    assert len(keywords) > 0

    # Ensure keywords are lowercase strings
    assert any("kurta" in k.lower() for k in keywords)
