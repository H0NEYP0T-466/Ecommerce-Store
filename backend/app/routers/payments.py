from fastapi import APIRouter

from app.models.bank_account import BankAccount
from app.schemas.bank_account import BankAccountPublicResponse

router = APIRouter(prefix="/api/payments", tags=["Payments"])


@router.get("/bank-accounts", response_model=list[BankAccountPublicResponse])
async def get_bank_accounts():
    """Get active bank accounts for checkout page."""
    accounts = await BankAccount.find(
        BankAccount.is_active == True
    ).sort("+display_order").to_list()

    return [
        BankAccountPublicResponse(
            id=str(a.id),
            bank_name=a.bank_name,
            account_name=a.account_name,
            account_number=a.account_number,
            iban=a.iban,
        ) for a in accounts
    ]
