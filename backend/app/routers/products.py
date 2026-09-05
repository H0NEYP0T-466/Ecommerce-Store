from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.models.product import Product, ProductVariation
from app.models.category import Category
from app.models.review import Review
from app.schemas.product import (
    ProductResponse,
    ProductDetailResponse,
    ProductListResponse,
    VariationResponse,
)

router = APIRouter(prefix="/api/products", tags=["Products"])


async def enrich_product(product: Product) -> ProductResponse:
    """Enrich a product with category name, images, rating, stock."""
    # Get category name
    category_name = None
    if product.category_id:
        category = await Category.get(product.category_id)
        if category:
            category_name = category.name

    # Get default variation for primary images
    default_var = await ProductVariation.find_one(
        ProductVariation.product_id == str(product.id),
        ProductVariation.is_default == True,
    )
    if not default_var:
        default_var = await ProductVariation.find_one(
            ProductVariation.product_id == str(product.id)
        )

    primary_image = None
    secondary_image = None
    if default_var and default_var.images:
        primary_image = default_var.images[0] if len(default_var.images) > 0 else None
        secondary_image = default_var.images[1] if len(default_var.images) > 1 else None

    # Get average rating and review count
    reviews = await Review.find(
        Review.product_id == str(product.id),
        Review.is_approved == True,
        Review.is_hidden == False,
    ).to_list()

    average_rating = None
    review_count = len(reviews)
    if review_count > 0:
        average_rating = round(sum(r.rating for r in reviews) / review_count, 1)

    # Get total stock
    variations = await ProductVariation.find(
        ProductVariation.product_id == str(product.id)
    ).to_list()
    total_stock = sum(v.stock_quantity for v in variations)

    return ProductResponse(
        id=str(product.id),
        name=product.name,
        slug=product.slug,
        description=product.description,
        category_id=product.category_id,
        category_name=category_name,
        actual_price=product.actual_price,
        discount_price=product.discount_price,
        is_active=product.is_active,
        seo_keywords=product.seo_keywords,
        primary_image=primary_image,
        secondary_image=secondary_image,
        average_rating=average_rating,
        review_count=review_count,
        total_stock=total_stock,
        created_at=product.created_at,
        updated_at=product.updated_at,
    )


@router.get("", response_model=ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    color: Optional[str] = None,
    size: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    sort: Optional[str] = Query(None, regex="^(price_asc|price_desc|newest|rating)$"),
):
    """Browse product catalog with filters, search, sort, and pagination."""
    # Build filter
    filter_conditions = [{"is_active": True}]

    if category:
        # Find category by slug or ID
        cat = await Category.find_one(
            {"$or": [{"slug": category}, {"_id": category}]}
        )
        if cat:
            # Include subcategories
            subcats = await Category.find(Category.parent_id == str(cat.id)).to_list()
            cat_ids = [str(cat.id)] + [str(sc.id) for sc in subcats]
            filter_conditions.append({"category_id": {"$in": cat_ids}})

    if search:
        filter_conditions.append({
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"seo_keywords": {"$regex": search, "$options": "i"}},
            ]
        })

    if min_price is not None:
        filter_conditions.append({"actual_price": {"$gte": min_price}})
    if max_price is not None:
        filter_conditions.append({"actual_price": {"$lte": max_price}})

    mongo_filter = {"$and": filter_conditions} if len(filter_conditions) > 1 else filter_conditions[0]

    # If filtering by color or size, get matching product IDs from variations first
    if color or size:
        var_filter = {}
        if color:
            var_filter["color"] = {"$regex": color, "$options": "i"}
        if size:
            var_filter["size"] = size

        matching_vars = await ProductVariation.find(var_filter).to_list()
        matching_product_ids = list(set(v.product_id for v in matching_vars))

        if matching_product_ids:
            filter_conditions.append({"_id": {"$in": [pid for pid in matching_product_ids]}})
        else:
            return ProductListResponse(products=[], total=0, page=page, page_size=page_size)

        mongo_filter = {"$and": filter_conditions}

    # Sort
    sort_key = "-created_at"  # Default: newest
    if sort == "price_asc":
        sort_key = "+actual_price"
    elif sort == "price_desc":
        sort_key = "-actual_price"
    elif sort == "newest":
        sort_key = "-created_at"
    # rating sort handled post-query

    total = await Product.find(mongo_filter).count()
    products = await Product.find(mongo_filter).sort(sort_key).skip(
        (page - 1) * page_size
    ).limit(page_size).to_list()

    enriched = [await enrich_product(p) for p in products]

    # Sort by rating if requested (post-query since it's computed)
    if sort == "rating":
        enriched.sort(key=lambda p: p.average_rating or 0, reverse=True)

    return ProductListResponse(
        products=enriched,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{slug}", response_model=ProductDetailResponse)
async def get_product(slug: str):
    """Get a single product with all variations."""
    product = await Product.find_one(Product.slug == slug)
    if not product:
        # Try by ID
        product = await Product.get(slug)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    enriched = await enrich_product(product)

    # Get all variations
    variations = await ProductVariation.find(
        ProductVariation.product_id == str(product.id)
    ).to_list()

    var_responses = [
        VariationResponse(
            id=str(v.id),
            product_id=v.product_id,
            color=v.color,
            size=v.size,
            stock_quantity=v.stock_quantity,
            images=v.images,
            video_url=v.video_url,
            is_default=v.is_default,
        )
        for v in variations
    ]

    return ProductDetailResponse(
        **enriched.model_dump(),
        variations=var_responses,
    )
