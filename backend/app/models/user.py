from datetime import datetime
from enum import Enum
from typing import Optional

from beanie import Document, Indexed
from pydantic import EmailStr, Field


class UserRole(str, Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"


class User(Document):
    """User document — customers and admins."""

    email: Indexed(EmailStr, unique=True)
    password_hash: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    is_active: bool = True

    # Password reset
    reset_token: Optional[str] = None
    reset_token_expires: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

    class Settings:
        name = "users"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
