from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.models.product import Product, ProductVariation
from app.models.category import Category
from app.models.user import User
from app.schemas.product import (
    ProductCreateRequest,
    ProductUpdateRequest,
    ProductResponse,
    ProductDetailResponse,
    ProductListResponse,
    VariationCreateRequest,
    VariationUpdateRequest,
    VariationResponse,
)
from app.routers.products import enrich_product
from app.utils.security import require_admin
from app.utils.helpers import generate_slug
from app.services.seo_service import generate_seo_keywords

router = APIRouter(prefix="/api/admin/products", tags=["Admin - Products"])


@router.get("", response_model=ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    admin: User = Depends(require_admin),
):
    """Admin list all products (including inactive)."""
    filter_conditions = []

    if category_id:
        filter_conditions.append({"category_id": category_id})
    if search:
        filter_conditions.append({
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]
        })
    if is_active is not None:
        filter_conditions.append({"is_active": is_active})

    mongo_filter = {"$and": filter_conditions} if filter_conditions else {}

    total = await Product.find(mongo_filter).count()
    products = await Product.find(mongo_filter).sort("-created_at").skip(
        (page - 1) * page_size
    ).limit(page_size).to_list()

    enriched = [await enrich_product(p) for p in products]

    return ProductListResponse(
        products=enriched,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreateRequest,
    admin: User = Depends(require_admin),
):
    """Create a new product with variations."""
    # Validate category
    category = await Category.get(data.category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    # Generate slug
    slug = generate_slug(data.name)
    existing = await Product.find_one(Product.slug == slug)
    if existing:
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"

    # Auto-generate SEO keywords if none provided
    seo_keywords = data.seo_keywords
    if not seo_keywords:
        seo_keywords = generate_seo_keywords(data.name, category.name, data.description)

    product = Product(
        name=data.name,
        slug=slug,
        description=data.description,
        category_id=data.category_id,
        actual_price=data.actual_price,
        discount_price=data.discount_price,
        seo_keywords=seo_keywords,
    )
    await product.insert()

    # Create variations
    var_responses = []
    for var_data in data.variations:
        variation = ProductVariation(
            product_id=str(product.id),
            color=var_data.color,
            size=var_data.size,
            stock_quantity=var_data.stock_quantity,
            images=var_data.images,
            video_url=var_data.video_url,
            is_default=var_data.is_default,
        )
        await variation.insert()
        var_responses.append(VariationResponse(
            id=str(variation.id),
            product_id=variation.product_id,
            color=variation.color,
            size=variation.size,
            stock_quantity=variation.stock_quantity,
            images=variation.images,
            video_url=variation.video_url,
            is_default=variation.is_default,
        ))

    enriched = await enrich_product(product)
    return ProductDetailResponse(**enriched.model_dump(), variations=var_responses)


@router.put("/{product_id}", response_model=ProductDetailResponse)
async def update_product(
    product_id: str,
    data: ProductUpdateRequest,
    admin: User = Depends(require_admin),
):
    """Update a product."""
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if data.name is not None:
        product.name = data.name
        product.slug = generate_slug(data.name)
    if data.description is not None:
        product.description = data.description
    if data.category_id is not None:
        product.category_id = data.category_id
    if data.actual_price is not None:
        product.actual_price = data.actual_price
    if data.discount_price is not None:
        product.discount_price = data.discount_price
    if data.is_active is not None:
        product.is_active = data.is_active
    if data.seo_keywords is not None:
        product.seo_keywords = data.seo_keywords

    product.updated_at = datetime.utcnow()
    await product.save()

    # Get variations
    variations = await ProductVariation.find(
        ProductVariation.product_id == str(product.id)
    ).to_list()

    var_responses = [
        VariationResponse(
            id=str(v.id), product_id=v.product_id, color=v.color,
            size=v.size, stock_quantity=v.stock_quantity, images=v.images,
            video_url=v.video_url, is_default=v.is_default,
        ) for v in variations
    ]

    enriched = await enrich_product(product)
    return ProductDetailResponse(**enriched.model_dump(), variations=var_responses)


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    admin: User = Depends(require_admin),
):
    """Soft-delete a product."""
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    product.is_active = False
    product.updated_at = datetime.utcnow()
    await product.save()

    return {"message": "Product deactivated"}


@router.post("/{product_id}/duplicate", response_model=ProductDetailResponse)
async def duplicate_product(
    product_id: str,
    admin: User = Depends(require_admin),
):
    """Deep copy a product with all its variations."""
    original = await Product.get(product_id)
    if not original:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    new_name = f"Copy of {original.name}"
    new_slug = generate_slug(new_name)
    existing = await Product.find_one(Product.slug == new_slug)
    if existing:
        new_slug = f"{new_slug}-{int(datetime.utcnow().timestamp())}"

    new_product = Product(
        name=new_name,
        slug=new_slug,
        description=original.description,
        category_id=original.category_id,
        actual_price=original.actual_price,
        discount_price=original.discount_price,
        seo_keywords=original.seo_keywords,
        is_active=False,  # Start as inactive so admin can review before publishing
    )
    await new_product.insert()

    # Duplicate variations
    original_vars = await ProductVariation.find(
        ProductVariation.product_id == str(original.id)
    ).to_list()

    var_responses = []
    for ov in original_vars:
        new_var = ProductVariation(
            product_id=str(new_product.id),
            color=ov.color,
            size=ov.size,
            stock_quantity=ov.stock_quantity,
            images=ov.images,  # Reuse same image references
            video_url=ov.video_url,
            is_default=ov.is_default,
        )
        await new_var.insert()
        var_responses.append(VariationResponse(
            id=str(new_var.id), product_id=new_var.product_id, color=new_var.color,
            size=new_var.size, stock_quantity=new_var.stock_quantity, images=new_var.images,
            video_url=new_var.video_url, is_default=new_var.is_default,
        ))

    enriched = await enrich_product(new_product)
    return ProductDetailResponse(**enriched.model_dump(), variations=var_responses)


# --- Variation management ---

@router.post("/{product_id}/variations", response_model=VariationResponse, status_code=status.HTTP_201_CREATED)
async def add_variation(
    product_id: str,
    data: VariationCreateRequest,
    admin: User = Depends(require_admin),
):
    """Add a variation to a product."""
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    variation = ProductVariation(
        product_id=product_id,
        color=data.color,
        size=data.size,
        stock_quantity=data.stock_quantity,
        images=data.images,
        video_url=data.video_url,
        is_default=data.is_default,
    )
    await variation.insert()

    return VariationResponse(
        id=str(variation.id), product_id=variation.product_id, color=variation.color,
        size=variation.size, stock_quantity=variation.stock_quantity, images=variation.images,
        video_url=variation.video_url, is_default=variation.is_default,
    )


@router.put("/{product_id}/variations/{variation_id}", response_model=VariationResponse)
async def update_variation(
    product_id: str,
    variation_id: str,
    data: VariationUpdateRequest,
    admin: User = Depends(require_admin),
):
    """Update a product variation."""
    variation = await ProductVariation.get(variation_id)
    if not variation or variation.product_id != product_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variation not found")

    if data.color is not None:
        variation.color = data.color
    if data.size is not None:
        variation.size = data.size
    if data.stock_quantity is not None:
        variation.stock_quantity = data.stock_quantity
    if data.images is not None:
        variation.images = data.images
    if data.video_url is not None:
        variation.video_url = data.video_url
    if data.is_default is not None:
        variation.is_default = data.is_default

    variation.updated_at = datetime.utcnow()
    await variation.save()

    return VariationResponse(
        id=str(variation.id), product_id=variation.product_id, color=variation.color,
        size=variation.size, stock_quantity=variation.stock_quantity, images=variation.images,
        video_url=variation.video_url, is_default=variation.is_default,
    )


@router.delete("/{product_id}/variations/{variation_id}")
async def delete_variation(
    product_id: str,
    variation_id: str,
    admin: User = Depends(require_admin),
):
    """Delete a product variation."""
    variation = await ProductVariation.get(variation_id)
    if not variation or variation.product_id != product_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variation not found")

    await variation.delete()
    return {"message": "Variation deleted"}


@router.post("/{product_id}/generate-seo")
async def generate_seo(
    product_id: str,
    admin: User = Depends(require_admin),
):
    """Auto-generate SEO keywords for a product."""
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    category = await Category.get(product.category_id)
    category_name = category.name if category else ""

    keywords = generate_seo_keywords(product.name, category_name, product.description)
    product.seo_keywords = keywords
    product.updated_at = datetime.utcnow()
    await product.save()

    return {"seo_keywords": keywords}
