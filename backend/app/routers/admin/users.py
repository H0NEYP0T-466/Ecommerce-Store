from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.models.user import User, UserRole
from app.models.order import Order
from app.schemas.user import (
    UserResponse,
    UserListResponse,
    AdminUserCreateRequest,
    AdminUserUpdateRequest,
)
from app.utils.security import require_admin, hash_password

router = APIRouter(prefix="/api/admin/users", tags=["Admin - Users"])


def user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
        role=user.role.value,
        is_active=user.is_active,
        created_at=user.created_at,
        last_login=user.last_login,
    )


@router.get("", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    admin: User = Depends(require_admin),
):
    """List all users with pagination and search."""
    query = User.find()

    if search:
        query = User.find(
            {"$or": [
                {"email": {"$regex": search, "$options": "i"}},
                {"first_name": {"$regex": search, "$options": "i"}},
                {"last_name": {"$regex": search, "$options": "i"}},
            ]}
        )

    total = await query.count()
    users = await query.sort("-created_at").skip((page - 1) * page_size).limit(page_size).to_list()

    return UserListResponse(
        users=[user_to_response(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: AdminUserCreateRequest,
    admin: User = Depends(require_admin),
):
    """Admin creates a new user account."""
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        role=UserRole(data.role) if data.role in [r.value for r in UserRole] else UserRole.CUSTOMER,
    )
    await user.insert()
    return user_to_response(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    data: AdminUserUpdateRequest,
    admin: User = Depends(require_admin),
):
    """Admin updates a user."""
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if data.first_name is not None:
        user.first_name = data.first_name
    if data.last_name is not None:
        user.last_name = data.last_name
    if data.phone is not None:
        user.phone = data.phone
    if data.email is not None:
        # Check uniqueness
        existing = await User.find_one(User.email == data.email)
        if existing and str(existing.id) != user_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")
        user.email = data.email
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.role is not None and data.role in [r.value for r in UserRole]:
        user.role = UserRole(data.role)

    user.updated_at = datetime.utcnow()
    await user.save()
    return user_to_response(user)


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    admin: User = Depends(require_admin),
):
    """Soft-delete a user (set is_active=False)."""
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Prevent self-deletion
    if str(user.id) == str(admin.id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own account")

    # Check for active orders
    active_orders = await Order.find(
        Order.user_id == user_id,
        Order.status.in_(["received", "packing", "dispatched"]),
    ).count()

    user.is_active = False
    user.updated_at = datetime.utcnow()
    await user.save()

    msg = "User deactivated"
    if active_orders > 0:
        msg += f" (warning: user has {active_orders} active order(s))"

    return {"message": msg}
