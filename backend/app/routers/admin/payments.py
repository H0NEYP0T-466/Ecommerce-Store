from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.models.bank_account import BankAccount
from app.models.order import Order, PaymentStatus
from app.models.user import User
from app.schemas.bank_account import (
    BankAccountCreateRequest,
    BankAccountUpdateRequest,
    BankAccountResponse,
)
from app.schemas.order import OrderResponse, OrderListResponse
from app.routers.admin.orders import order_to_response
from app.utils.security import require_admin

router = APIRouter(prefix="/api/admin/payments", tags=["Admin - Payments"])


@router.get("/bank-accounts", response_model=list[BankAccountResponse])
async def list_bank_accounts(admin: User = Depends(require_admin)):
    """List all bank accounts."""
    accounts = await BankAccount.find().sort("+display_order").to_list()
    return [
        BankAccountResponse(
            id=str(a.id),
            bank_name=a.bank_name,
            account_name=a.account_name,
            account_number=a.account_number,
            iban=a.iban,
            is_active=a.is_active,
            display_order=a.display_order,
        ) for a in accounts
    ]


@router.post("/bank-accounts", response_model=BankAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_bank_account(
    data: BankAccountCreateRequest,
    admin: User = Depends(require_admin),
):
    """Add a new bank account."""
    account = BankAccount(**data.model_dump())
    await account.insert()
    return BankAccountResponse(
        id=str(account.id),
        bank_name=account.bank_name,
        account_name=account.account_name,
        account_number=account.account_number,
        iban=account.iban,
        is_active=account.is_active,
        display_order=account.display_order,
    )


@router.put("/bank-accounts/{account_id}", response_model=BankAccountResponse)
async def update_bank_account(
    account_id: str,
    data: BankAccountUpdateRequest,
    admin: User = Depends(require_admin),
):
    """Update a bank account."""
    account = await BankAccount.get(account_id)
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bank account not found")

    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(account, key, value)

    account.updated_at = datetime.utcnow()
    await account.save()

    return BankAccountResponse(
        id=str(account.id),
        bank_name=account.bank_name,
        account_name=account.account_name,
        account_number=account.account_number,
        iban=account.iban,
        is_active=account.is_active,
        display_order=account.display_order,
    )


@router.delete("/bank-accounts/{account_id}")
async def delete_bank_account(
    account_id: str,
    admin: User = Depends(require_admin),
):
    """Delete a bank account."""
    account = await BankAccount.get(account_id)
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bank account not found")

    await account.delete()
    return {"message": "Bank account deleted"}


@router.get("/pending-orders", response_model=OrderListResponse)
async def get_pending_payment_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
):
    """Get orders with pending payment status."""
    query = Order.find(Order.payment_status == PaymentStatus.PENDING)
    total = await query.count()
    orders = await query.sort("-created_at").skip(
        (page - 1) * page_size
    ).limit(page_size).to_list()

    return OrderListResponse(
        orders=[order_to_response(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
    )
