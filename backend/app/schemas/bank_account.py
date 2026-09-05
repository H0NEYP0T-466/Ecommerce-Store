from pydantic import BaseModel
from typing import Optional


class BankAccountCreateRequest(BaseModel):
    bank_name: str
    account_name: str
    account_number: str
    iban: str
    is_active: bool = True
    display_order: int = 0


class BankAccountUpdateRequest(BaseModel):
    bank_name: Optional[str] = None
    account_name: Optional[str] = None
    account_number: Optional[str] = None
    iban: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class BankAccountResponse(BaseModel):
    id: str
    bank_name: str
    account_name: str
    account_number: str
    iban: str
    is_active: bool
    display_order: int


class BankAccountPublicResponse(BaseModel):
    """Public response with full details for checkout page."""
    id: str
    bank_name: str
    account_name: str
    account_number: str
    iban: str
