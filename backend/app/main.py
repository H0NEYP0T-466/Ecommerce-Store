import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import init_db, close_db
from app.middleware.rate_limit import limiter

import time
from fastapi.responses import JSONResponse

# Configure structured logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    force=True,
)
logging.getLogger("pymongo").setLevel(logging.WARNING)
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — detailed startup and shutdown logging."""
    logger.info("=" * 64)
    logger.info("  %-30s  [FastAPI Backend]", settings.APP_NAME)
    logger.info("  Listening on : http://0.0.0.0:%d", settings.PORT)
    logger.info("  Interactive Docs: http://localhost:%d/docs", settings.PORT)
    logger.info("  ReDoc Docs:       http://localhost:%d/redoc", settings.PORT)
    logger.info("  Environment:      %s", "Development (DEBUG=True)" if settings.DEBUG else "Production")
    logger.info("  MongoDB URL:      %s", settings.MONGODB_URL)
    logger.info("  Database Name:    %s", settings.DB_NAME)
    logger.info("=" * 64)

    logger.info("[Startup] Starting database initialization...")
    await init_db()
    logger.info("[Startup] Server initialization complete. Ready to receive requests.")
    yield
    logger.info("[Shutdown] Initiating graceful shutdown...")
    await close_db()
    logger.info("[Shutdown] All connections closed. Goodbye.")


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

# CORS configuration — supports development, staging, and production domains
cors_origins = [orig.strip() for orig in settings.FRONTEND_ORIGIN.split(",") if orig.strip()]
for default_origin in ["http://localhost:5173", "http://localhost:3000"]:
    if default_origin not in cors_origins:
        cors_origins.append(default_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if "*" not in cors_origins else ["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every incoming request and response with latency."""
    start_time = time.perf_counter()
    client_ip = request.client.host if request.client else "unknown"
    method = request.method
    path = request.url.path
    query = f"?{request.url.query}" if request.url.query else ""

    logger.info("--> %s %s%s (client: %s)", method, path, query, client_ip)
    try:
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.info(
            "<-- %s %s%s [%d] (%.2fms)",
            method,
            path,
            query,
            response.status_code,
            duration_ms,
        )
        return response
    except Exception as exc:
        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.error(
            "<-- %s %s%s [EXCEPTION: %s] (%.2fms)",
            method,
            path,
            query,
            exc,
            duration_ms,
            exc_info=True,
        )
        raise


# Unhandled Exception Handler
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Ensure any unhandled exception prints full traceback to logs."""
    logger.error("Unhandled exception on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc) if settings.DEBUG else None},
    )


# Health check
@app.get("/health")
@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring and Render keep-alive."""
    return {"status": "ok", "app": settings.APP_NAME, "port": settings.PORT}


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
