from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status

from app.models.user import User
from app.services import image_service
from app.utils.security import get_current_user

router = APIRouter(prefix="/api", tags=["Uploads"])


@router.post("/uploads", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    """Upload an image to GridFS. Returns the file ID and URL."""
    try:
        file_id = await image_service.upload_image(file)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return {
        "id": file_id,
        "url": f"/api/images/{file_id}",
    }


@router.get("/images/{file_id}")
async def get_image(file_id: str):
    """Serve an image from GridFS."""
    response = await image_service.get_image(file_id)
    if not response:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    return response
