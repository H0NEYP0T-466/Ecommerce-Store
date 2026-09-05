from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status

from app.models.user import User
from app.schemas.user import UserResponse, UserUpdateRequest, PasswordChangeRequest
from app.utils.security import get_current_user, hash_password, verify_password

router = APIRouter(prefix="/api/users", tags=["Users"])


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


@router.get("/me", response_model=UserResponse)
async def get_profile(user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return user_to_response(user)


@router.put("/me", response_model=UserResponse)
async def update_profile(
    data: UserUpdateRequest,
    user: User = Depends(get_current_user),
):
    """Update current user's profile."""
    if data.first_name is not None:
        user.first_name = data.first_name
    if data.last_name is not None:
        user.last_name = data.last_name
    if data.phone is not None:
        user.phone = data.phone

    user.updated_at = datetime.utcnow()
    await user.save()
    return user_to_response(user)


@router.put("/me/password")
async def change_password(
    data: PasswordChangeRequest,
    user: User = Depends(get_current_user),
):
    """Change current user's password."""
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be at least 6 characters",
        )

    user.password_hash = hash_password(data.new_password)
    user.updated_at = datetime.utcnow()
    await user.save()

    return {"message": "Password changed successfully"}
