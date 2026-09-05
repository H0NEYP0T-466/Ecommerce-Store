from datetime import datetime

from beanie import Document
from pydantic import Field


class BankAccount(Document):
    """Bank account for manual payment transfers."""

    bank_name: str
    account_name: str
    account_number: str
    iban: str
    is_active: bool = True
    display_order: int = 0

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "bank_accounts"
