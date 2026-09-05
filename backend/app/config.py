from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DB_NAME: str = "hamid_cloth_house"

    # JWT
    JWT_SECRET: str = "hamid-cloth-house-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRY_MINUTES: int = 15
    JWT_REFRESH_EXPIRY_DAYS: int = 7

    # SMTP Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: str = "noreply@hamidclothhouse.com"
    SMTP_USE_TLS: bool = True

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # App
    APP_NAME: str = "Hamid Cloth House"
    DEBUG: bool = True

    # Render keep-alive
    RENDER_SLEEP_PING_INTERVAL: int = 14  # minutes

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


settings = Settings()
