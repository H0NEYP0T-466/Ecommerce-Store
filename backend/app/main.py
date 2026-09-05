import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import init_db, close_db
from app.middleware.rate_limit import limiter

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — init and cleanup."""
    logger.info("Starting Hamid Cloth House API...")
    await init_db()
    logger.info("Database connected successfully")
    yield
    await close_db()
    logger.info("Database connection closed")


# Create FastAPI app
app = FastAPI(
    title="Hamid Cloth House API",
    description="E-commerce platform for Pakistani clothing",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_ORIGIN,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring and Render keep-alive."""
    return {"status": "ok", "app": settings.APP_NAME}


# Register routers
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.categories import router as categories_router
from app.routers.products import router as products_router
from app.routers.cart import router as cart_router
from app.routers.orders import router as orders_router
from app.routers.reviews import router as reviews_router
from app.routers.payments import router as payments_router
from app.routers.sliders import router as sliders_router
from app.routers.promotions import router as promotions_router
from app.routers.settings import router as settings_router
from app.routers.uploads import router as uploads_router
from app.routers.websocket import router as ws_router

# Admin routers
from app.routers.admin.users import router as admin_users_router
from app.routers.admin.categories import router as admin_categories_router
from app.routers.admin.products import router as admin_products_router
from app.routers.admin.orders import router as admin_orders_router
from app.routers.admin.reviews import router as admin_reviews_router
from app.routers.admin.payments import router as admin_payments_router
from app.routers.admin.sliders import router as admin_sliders_router
from app.routers.admin.promotions import router as admin_promotions_router
from app.routers.admin.settings import router as admin_settings_router
from app.routers.admin.reports import router as admin_reports_router

# Public routes
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(categories_router)
app.include_router(products_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(reviews_router)
app.include_router(payments_router)
app.include_router(sliders_router)
app.include_router(promotions_router)
app.include_router(settings_router)
app.include_router(uploads_router)
app.include_router(ws_router)

# Admin routes
app.include_router(admin_users_router)
app.include_router(admin_categories_router)
app.include_router(admin_products_router)
app.include_router(admin_orders_router)
app.include_router(admin_reviews_router)
app.include_router(admin_payments_router)
app.include_router(admin_sliders_router)
app.include_router(admin_promotions_router)
app.include_router(admin_settings_router)
app.include_router(admin_reports_router)
