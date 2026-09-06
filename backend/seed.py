"""Seed script — populates the database with initial data."""
import asyncio
from datetime import datetime, timedelta

from app.database import init_db, close_db
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.product import Product, ProductVariation
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus, StatusHistoryEntry
from app.models.review import Review
from app.models.slider import Slider
from app.models.promotion import Promotion
from app.models.settings import SiteSettings
from app.models.bank_account import BankAccount
from app.utils.security import hash_password
from app.utils.helpers import generate_slug


async def seed():
    await init_db()
    print("🌱 Seeding database...")

    # --- Users ---
    admin = await User.find_one(User.email == "admin@hamidcloth.com")
    if not admin:
        admin = User(
            email="admin@hamidcloth.com",
            password_hash=hash_password("admin123"),
            first_name="Hamid",
            last_name="Admin",
            phone="+923001234567",
            role=UserRole.ADMIN,
        )
        await admin.insert()
        print("✅ Admin user created: admin@hamidcloth.com / admin123")

    customers = []
    for i, (email, fname, lname, phone) in enumerate([
        ("ahmed@example.com", "Ahmed", "Khan", "+923011234567"),
        ("fatima@example.com", "Fatima", "Ali", "+923021234567"),
        ("hassan@example.com", "Hassan", "Raza", "+923031234567"),
    ]):
        user = await User.find_one(User.email == email)
        if not user:
            user = User(
                email=email,
                password_hash=hash_password("customer123"),
                first_name=fname,
                last_name=lname,
                phone=phone,
            )
            await user.insert()
        customers.append(user)
    print("✅ Sample customers created")

    # --- Categories ---
    categories = {}
    cat_data = [
        ("Men's Clothing", None),
        ("Women's Clothing", None),
        ("Kurtas", "Men's Clothing"),
        ("Shalwar Kameez", "Men's Clothing"),
        ("Waistcoats", "Men's Clothing"),
        ("Jackets", "Men's Clothing"),
        ("Ladies Kurtas", "Women's Clothing"),
        ("Shawls & Dupattas", "Women's Clothing"),
        ("Suits", "Women's Clothing"),
        ("Accessories", None),
    ]

    for name, parent_name in cat_data:
        existing = await Category.find_one(Category.slug == generate_slug(name))
        if not existing:
            parent_id = str(categories[parent_name].id) if parent_name and parent_name in categories else None
            cat = Category(
                name=name,
                slug=generate_slug(name),
                parent_id=parent_id,
                display_order=len(categories),
            )
            await cat.insert()
            categories[name] = cat
        else:
            categories[name] = existing
    print("✅ Categories created")

    # --- Products ---
    products_data = [
        {
            "name": "Classic Cotton Kurta",
            "description": "Premium cotton kurta with embroidered collar. Perfect for casual and semi-formal occasions. Breathable fabric suitable for Pakistani summers.",
            "category": "Kurtas",
            "actual_price": 2500,
            "discount_price": 1999,
            "variations": [
                {"color": "White", "size": "M", "stock": 25, "images": ["https://placehold.co/600x800/ffffff/000000?text=White+Kurta+1", "https://placehold.co/600x800/f5f5f5/000000?text=White+Kurta+2"]},
                {"color": "Navy Blue", "size": "L", "stock": 15, "images": ["https://placehold.co/600x800/001f3f/ffffff?text=Navy+Kurta+1", "https://placehold.co/600x800/003366/ffffff?text=Navy+Kurta+2"]},
                {"color": "Black", "size": "XL", "stock": 10, "images": ["https://placehold.co/600x800/000000/ffffff?text=Black+Kurta+1", "https://placehold.co/600x800/1a1a1a/ffffff?text=Black+Kurta+2"]},
            ],
        },
        {
            "name": "Premium Shalwar Kameez Set",
            "description": "Elegant shalwar kameez set in premium wash-n-wear fabric. Includes matching shalwar. Ideal for daily wear and office use.",
            "category": "Shalwar Kameez",
            "actual_price": 4500,
            "discount_price": 3800,
            "variations": [
                {"color": "Cream", "size": "M", "stock": 20, "images": ["https://placehold.co/600x800/fffdd0/000000?text=Cream+SK+1", "https://placehold.co/600x800/fff8dc/000000?text=Cream+SK+2"]},
                {"color": "Light Grey", "size": "L", "stock": 12, "images": ["https://placehold.co/600x800/d3d3d3/000000?text=Grey+SK+1", "https://placehold.co/600x800/c0c0c0/000000?text=Grey+SK+2"]},
            ],
        },
        {
            "name": "Embroidered Formal Waistcoat",
            "description": "Hand-embroidered waistcoat in rich velvet. Perfect for weddings, Eid, and formal events. Available in multiple sizes.",
            "category": "Waistcoats",
            "actual_price": 6500,
            "discount_price": None,
            "variations": [
                {"color": "Maroon", "size": "M", "stock": 8, "images": ["https://placehold.co/600x800/800000/ffffff?text=Maroon+WC+1", "https://placehold.co/600x800/990000/ffffff?text=Maroon+WC+2"]},
                {"color": "Black", "size": "L", "stock": 6, "images": ["https://placehold.co/600x800/000000/ffffff?text=Black+WC+1", "https://placehold.co/600x800/1a1a1a/ffffff?text=Black+WC+2"]},
            ],
        },
        {
            "name": "Winter Leather Jacket",
            "description": "Genuine leather jacket with inner fleece lining. Stylish design with multiple pockets. Perfect for Pakistani winters.",
            "category": "Jackets",
            "actual_price": 12000,
            "discount_price": 9999,
            "variations": [
                {"color": "Brown", "size": "L", "stock": 5, "images": ["https://placehold.co/600x800/8B4513/ffffff?text=Brown+Jacket+1", "https://placehold.co/600x800/A0522D/ffffff?text=Brown+Jacket+2"]},
                {"color": "Black", "size": "XL", "stock": 7, "images": ["https://placehold.co/600x800/000000/ffffff?text=Black+Jacket+1", "https://placehold.co/600x800/1a1a1a/ffffff?text=Black+Jacket+2"]},
            ],
        },
        {
            "name": "Casual Cotton Kurta - Summer Collection",
            "description": "Lightweight cotton kurta from our summer collection. Cool and comfortable with modern cut design.",
            "category": "Kurtas",
            "actual_price": 1800,
            "discount_price": 1499,
            "variations": [
                {"color": "Sky Blue", "size": "S", "stock": 30, "images": ["https://placehold.co/600x800/87CEEB/000000?text=Blue+Kurta+1", "https://placehold.co/600x800/87CEFA/000000?text=Blue+Kurta+2"]},
                {"color": "Olive Green", "size": "M", "stock": 18, "images": ["https://placehold.co/600x800/6B8E23/ffffff?text=Green+Kurta+1", "https://placehold.co/600x800/556B2F/ffffff?text=Green+Kurta+2"]},
            ],
        },
        {
            "name": "Ladies Embroidered Kurta",
            "description": "Beautifully embroidered ladies kurta in lawn fabric. Perfect for casual outings and family gatherings. Soft and breathable.",
            "category": "Ladies Kurtas",
            "actual_price": 3200,
            "discount_price": 2699,
            "variations": [
                {"color": "Pink", "size": "S", "stock": 15, "images": ["https://placehold.co/600x800/FFB6C1/000000?text=Pink+Ladies+1", "https://placehold.co/600x800/FFC0CB/000000?text=Pink+Ladies+2"]},
                {"color": "Teal", "size": "M", "stock": 12, "images": ["https://placehold.co/600x800/008080/ffffff?text=Teal+Ladies+1", "https://placehold.co/600x800/20B2AA/ffffff?text=Teal+Ladies+2"]},
            ],
        },
        {
            "name": "Pashmina Shawl - Premium",
            "description": "Pure pashmina wool shawl with delicate embroidery. Warm and luxurious. A must-have for winter fashion.",
            "category": "Shawls & Dupattas",
            "actual_price": 8500,
            "discount_price": None,
            "variations": [
                {"color": "Beige", "size": None, "stock": 10, "images": ["https://placehold.co/600x800/F5F5DC/000000?text=Beige+Shawl+1", "https://placehold.co/600x800/FAEBD7/000000?text=Beige+Shawl+2"]},
                {"color": "Deep Red", "size": None, "stock": 8, "images": ["https://placehold.co/600x800/8B0000/ffffff?text=Red+Shawl+1", "https://placehold.co/600x800/DC143C/ffffff?text=Red+Shawl+2"]},
            ],
        },
        {
            "name": "3-Piece Stitched Suit",
            "description": "Complete 3-piece stitched suit including shirt, trouser, and dupatta. Premium lawn fabric with digital print.",
            "category": "Suits",
            "actual_price": 5500,
            "discount_price": 4499,
            "variations": [
                {"color": "Coral", "size": "M", "stock": 14, "images": ["https://placehold.co/600x800/FF7F50/000000?text=Coral+Suit+1", "https://placehold.co/600x800/FF6347/ffffff?text=Coral+Suit+2"]},
                {"color": "Mint Green", "size": "L", "stock": 9, "images": ["https://placehold.co/600x800/98FB98/000000?text=Mint+Suit+1", "https://placehold.co/600x800/90EE90/000000?text=Mint+Suit+2"]},
            ],
        },
        {
            "name": "Chiffon Dupatta - Luxury",
            "description": "Luxury chiffon dupatta with hand-embroidered borders. Adds elegance to any outfit. Available in stunning colors.",
            "category": "Shawls & Dupattas",
            "actual_price": 2200,
            "discount_price": 1899,
            "variations": [
                {"color": "Gold", "size": None, "stock": 20, "images": ["https://placehold.co/600x800/FFD700/000000?text=Gold+Dupatta+1", "https://placehold.co/600x800/DAA520/000000?text=Gold+Dupatta+2"]},
                {"color": "Silver", "size": None, "stock": 16, "images": ["https://placehold.co/600x800/C0C0C0/000000?text=Silver+Dupatta+1", "https://placehold.co/600x800/A9A9A9/000000?text=Silver+Dupatta+2"]},
            ],
        },
        {
            "name": "Formal Shalwar Kameez - Wedding Collection",
            "description": "Premium formal shalwar kameez with gold embroidery. Designed for weddings and formal events. Includes matching shalwar.",
            "category": "Shalwar Kameez",
            "actual_price": 9500,
            "discount_price": None,
            "variations": [
                {"color": "Royal Blue", "size": "L", "stock": 6, "images": ["https://placehold.co/600x800/4169E1/ffffff?text=Royal+SK+1", "https://placehold.co/600x800/0000CD/ffffff?text=Royal+SK+2"]},
                {"color": "Emerald Green", "size": "XL", "stock": 4, "images": ["https://placehold.co/600x800/50C878/000000?text=Emerald+SK+1", "https://placehold.co/600x800/2E8B57/ffffff?text=Emerald+SK+2"]},
            ],
        },
    ]

    created_products = []
    for pdata in products_data:
        slug = generate_slug(pdata["name"])
        existing = await Product.find_one(Product.slug == slug)
        if existing:
            created_products.append(existing)
            continue

        cat = categories.get(pdata["category"])
        product = Product(
            name=pdata["name"],
            slug=slug,
            description=pdata["description"],
            category_id=str(cat.id) if cat else "",
            actual_price=pdata["actual_price"],
            discount_price=pdata["discount_price"],
            seo_keywords=[pdata["name"].lower(), pdata["category"].lower(), "pakistani clothing", "hamid cloth house"],
        )
        await product.insert()
        created_products.append(product)

        for i, var in enumerate(pdata["variations"]):
            variation = ProductVariation(
                product_id=str(product.id),
                color=var["color"],
                size=var["size"],
                stock_quantity=var["stock"],
                images=var["images"],
                is_default=(i == 0),
            )
            await variation.insert()

    print(f"✅ {len(created_products)} products created with variations")

    # --- Bank Accounts ---
    if await BankAccount.find().count() == 0:
        for bank in [
            {"bank_name": "HBL (Habib Bank Limited)", "account_name": "Hamid Cloth House", "account_number": "1234567890123", "iban": "PK36HABB0012345678901234", "display_order": 0},
            {"bank_name": "MCB Bank", "account_name": "Hamid Cloth House", "account_number": "9876543210987", "iban": "PK36MUCB0098765432109876", "display_order": 1},
        ]:
            await BankAccount(**bank).insert()
        print("✅ Bank accounts created")

    # --- Sliders ---
    if await Slider.find().count() == 0:
        for slider in [
            {"image_url": "https://placehold.co/1400x500/000000/ffffff?text=New+Arrivals+%E2%80%94+Men's+Collection", "title": "New Arrivals", "subtitle": "Discover our latest men's collection", "display_order": 0},
            {"image_url": "https://placehold.co/1400x500/1a1a1a/ffffff?text=Summer+Sale+%E2%80%94+Up+to+30%25+Off", "title": "Summer Sale", "subtitle": "Up to 30% off on selected items", "display_order": 1},
            {"image_url": "https://placehold.co/1400x500/333333/ffffff?text=Women's+Collection+%E2%80%94+Eid+Special", "title": "Women's Eid Collection", "subtitle": "Elegant designs for every occasion", "display_order": 2},
        ]:
            await Slider(**slider).insert()
        print("✅ Sliders created")

    # --- Site Settings ---
    settings = await SiteSettings.get_or_create()
    settings.display_name = "Hamid Cloth House"
    settings.whatsapp_number = "+923001234567"
    settings.contact_info = "Shop #123, Main Bazaar, Lahore, Pakistan"
    settings.facebook_url = "https://facebook.com/hamidclothhouse"
    settings.instagram_url = "https://instagram.com/hamidclothhouse"
    await settings.save()
    print("✅ Site settings configured")

    # --- Sample Orders ---
    if await Order.find().count() == 0 and len(created_products) > 0 and len(customers) > 0:
        statuses = [
            (OrderStatus.DELIVERED, PaymentStatus.PAID),
            (OrderStatus.DISPATCHED, PaymentStatus.PAID),
            (OrderStatus.PACKING, PaymentStatus.PENDING),
            (OrderStatus.RECEIVED, PaymentStatus.PENDING),
        ]

        for i, (order_status, payment_stat) in enumerate(statuses):
            customer = customers[i % len(customers)]
            product = created_products[i % len(created_products)]
            var = await ProductVariation.find_one(ProductVariation.product_id == str(product.id))
            if not var:
                continue

            unit_price = product.discount_price or product.actual_price
            qty = i + 1

            order = Order(
                order_number=f"HC-20260901-{i+1:04d}",
                user_id=str(customer.id),
                customer_name=customer.full_name,
                customer_email=customer.email,
                customer_phone=customer.phone or "",
                customer_address="House #456, Street 7, Lahore, Pakistan",
                items=[OrderItem(
                    product_variation_id=str(var.id),
                    product_name=product.name,
                    color=var.color,
                    size=var.size,
                    quantity=qty,
                    unit_price=unit_price,
                    subtotal=unit_price * qty,
                )],
                total_amount=unit_price * qty,
                payment_method="HBL (Habib Bank Limited)",
                payment_status=payment_stat,
                status=order_status,
                status_history=[
                    StatusHistoryEntry(status=OrderStatus.RECEIVED, changed_by="system", notes="Order placed"),
                ],
                created_at=datetime.utcnow() - timedelta(days=10 - i * 3),
            )
            await order.insert()

        print("✅ Sample orders created")

    # --- Sample Reviews ---
    if await Review.find().count() == 0 and len(created_products) > 0:
        reviews_data = [
            (0, 0, 5, "Excellent quality kurta! The cotton is soft and the stitching is perfect. Will order again."),
            (1, 1, 4, "Good quality shalwar kameez. Delivery was fast. Slightly different shade than shown."),
            (0, 2, 5, "Amazing product! Fits perfectly and looks great. Highly recommended."),
            (2, 0, 4, "Beautiful waistcoat. The embroidery work is stunning. Great for Eid."),
        ]

        for prod_idx, cust_idx, rating, comment in reviews_data:
            if prod_idx < len(created_products) and cust_idx < len(customers):
                review = Review(
                    product_id=str(created_products[prod_idx].id),
                    user_id=str(customers[cust_idx].id),
                    user_name=customers[cust_idx].full_name,
                    rating=rating,
                    comment=comment,
                    is_approved=True,
                )
                await review.insert()

        print("✅ Sample reviews created")

    print("\n🎉 Seeding complete!")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("Admin Login: admin@hamidcloth.com / admin123")
    print("Customer Login: ahmed@example.com / customer123")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    await close_db()


if __name__ == "__main__":
    asyncio.run(seed())
