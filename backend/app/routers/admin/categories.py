from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional

from app.models.category import Category
from app.models.product import Product
from app.models.user import User
from app.schemas.category import (
    CategoryCreateRequest,
    CategoryUpdateRequest,
    CategoryResponse,
)
from app.utils.security import require_admin
from app.utils.helpers import generate_slug

router = APIRouter(prefix="/api/admin/categories", tags=["Admin - Categories"])


def cat_to_response(cat: Category) -> CategoryResponse:
    return CategoryResponse(
        id=str(cat.id),
        name=cat.name,
        slug=cat.slug,
        parent_id=cat.parent_id,
        is_active=cat.is_active,
        display_order=cat.display_order,
    )


@router.get("", response_model=list[CategoryResponse])
async def list_categories(admin: User = Depends(require_admin)):
    """List all categories (including inactive)."""
    categories = await Category.find().sort("+display_order").to_list()
    return [cat_to_response(c) for c in categories]


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreateRequest,
    admin: User = Depends(require_admin),
):
    """Create a new category."""
    slug = generate_slug(data.name)

    # Ensure unique slug
    existing = await Category.find_one(Category.slug == slug)
    if existing:
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"

    # Validate parent exists if provided
    if data.parent_id:
        parent = await Category.get(data.parent_id)
        if not parent:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent category not found")

    category = Category(
        name=data.name,
        slug=slug,
        parent_id=data.parent_id,
        display_order=data.display_order,
    )
    await category.insert()
    return cat_to_response(category)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    data: CategoryUpdateRequest,
    admin: User = Depends(require_admin),
):
    """Update a category."""
    category = await Category.get(category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    if data.name is not None:
        category.name = data.name
        category.slug = generate_slug(data.name)
    if data.parent_id is not None:
        category.parent_id = data.parent_id
    if data.is_active is not None:
        category.is_active = data.is_active
    if data.display_order is not None:
        category.display_order = data.display_order

    category.updated_at = datetime.utcnow()
    await category.save()
    return cat_to_response(category)


@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    admin: User = Depends(require_admin),
):
    """Soft-delete a category. Warns if products exist."""
    category = await Category.get(category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    product_count = await Product.find(Product.category_id == category_id).count()

    category.is_active = False
    category.updated_at = datetime.utcnow()
    await category.save()

    msg = "Category deactivated"
    if product_count > 0:
        msg += f" (warning: {product_count} product(s) are in this category)"

    return {"message": msg}
