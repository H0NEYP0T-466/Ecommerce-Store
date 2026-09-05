from fastapi import APIRouter, HTTPException, status

from app.models.category import Category
from app.schemas.category import CategoryResponse

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("", response_model=list[CategoryResponse])
async def get_categories():
    """Get all active categories in hierarchical structure."""
    categories = await Category.find(Category.is_active == True).sort("+display_order").to_list()

    # Build hierarchy
    cat_map = {}
    roots = []

    for cat in categories:
        cat_resp = CategoryResponse(
            id=str(cat.id),
            name=cat.name,
            slug=cat.slug,
            parent_id=cat.parent_id,
            is_active=cat.is_active,
            display_order=cat.display_order,
            children=[],
        )
        cat_map[str(cat.id)] = cat_resp

    for cat_resp in cat_map.values():
        if cat_resp.parent_id and cat_resp.parent_id in cat_map:
            cat_map[cat_resp.parent_id].children.append(cat_resp)
        else:
            roots.append(cat_resp)

    return roots
