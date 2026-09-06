import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from beanie import init_beanie

from app.config import settings

logger = logging.getLogger("app.database")

# Global references
client: AsyncIOMotorClient = None
db = None
fs_bucket: AsyncIOMotorGridFSBucket = None


async def init_db():
    """Initialize MongoDB connection, Beanie ODM, and GridFS bucket with diagnostics."""
    global client, db, fs_bucket

    logger.info("Initializing MongoDB connection...")
    logger.info("  URL: %s", settings.MONGODB_URL)
    logger.info("  Database: %s", settings.DB_NAME)

    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,
        )
        # Ping the server to verify connectivity immediately
        server_info = await client.server_info()
        logger.info("MongoDB connected successfully! (Engine version: %s)", server_info.get("version", "unknown"))

        db = client[settings.DB_NAME]
        fs_bucket = AsyncIOMotorGridFSBucket(db)
        logger.info("GridFS bucket '%s.fs' initialized for image storage", settings.DB_NAME)

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

        document_models = [
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
        ]

        logger.info("Initializing Beanie ODM with %d document models...", len(document_models))
        await init_beanie(
            database=db,
            document_models=document_models,
        )
        logger.info("Beanie ODM and database indexes initialized successfully!")

        # Log document counts for insight into current database state
        try:
            users_count = await User.count()
            products_count = await Product.count()
            categories_count = await Category.count()
            orders_count = await Order.count()
            logger.info(
                "Database ready: %d users, %d categories, %d products, %d orders loaded",
                users_count, categories_count, products_count, orders_count,
            )
        except Exception as count_err:
            logger.debug("Could not fetch collection stats: %s", count_err)

    except Exception as e:
        logger.critical("MongoDB connection FAILED: %s", e)
        logger.critical(
            "Please ensure MongoDB is running at '%s'. If using Docker, run 'docker compose up -d mongodb' or 'sudo systemctl start mongod'.",
            settings.MONGODB_URL,
        )
        raise


async def close_db():
    """Close MongoDB connection."""
    global client
    if client:
        logger.info("Closing MongoDB connection...")
        client.close()
        logger.info("MongoDB connection closed successfully")


def get_fs_bucket() -> AsyncIOMotorGridFSBucket:
    """Get the GridFS bucket instance."""
    return fs_bucket


def get_db():
    """Get the database instance."""
    return db
