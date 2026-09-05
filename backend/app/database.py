from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from beanie import init_beanie

from app.config import settings

# Global references
client: AsyncIOMotorClient = None
db = None
fs_bucket: AsyncIOMotorGridFSBucket = None


async def init_db():
    """Initialize MongoDB connection, Beanie ODM, and GridFS bucket."""
    global client, db, fs_bucket

    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DB_NAME]
    fs_bucket = AsyncIOMotorGridFSBucket(db)

    # Import all document models for Beanie initialization
    from app.models.user import User
    from app.models.category import Category
    from app.models.product import Product, ProductVariation
    from app.models.cart import Cart
    from app.models.order import Order, OrderCounter
    from app.models.review import Review
    from app.models.slider import Slider
    from app.models.promotion import Promotion
    from app.models.settings import SiteSettings
    from app.models.notification import Notification
    from app.models.bank_account import BankAccount

    await init_beanie(
        database=db,
        document_models=[
            User,
            Category,
            Product,
            ProductVariation,
            Cart,
            Order,
            OrderCounter,
            Review,
            Slider,
            Promotion,
            SiteSettings,
            Notification,
            BankAccount,
        ],
    )


async def close_db():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()


def get_fs_bucket() -> AsyncIOMotorGridFSBucket:
    """Get the GridFS bucket instance."""
    return fs_bucket


def get_db():
    """Get the database instance."""
    return db
