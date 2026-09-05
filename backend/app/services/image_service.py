import io
import logging
from typing import Optional

from bson import ObjectId
from fastapi import UploadFile
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorGridFSBucket

from app.database import get_fs_bucket

logger = logging.getLogger(__name__)

# Allowed image MIME types
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB


async def upload_image(
    file: UploadFile,
    filename: Optional[str] = None,
) -> str:
    """Upload an image to GridFS.
    
    Args:
        file: The uploaded file
        filename: Optional custom filename
        
    Returns:
        The GridFS file ID as a string
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError(f"Unsupported image type: {file.content_type}. Allowed: {list(ALLOWED_IMAGE_TYPES.keys())}")

    content = await file.read()

    if len(content) > MAX_IMAGE_SIZE:
        raise ValueError(f"Image too large. Maximum size: {MAX_IMAGE_SIZE // (1024 * 1024)}MB")

    fs = get_fs_bucket()
    fname = filename or file.filename or "image"

    file_id = await fs.upload_from_stream(
        fname,
        io.BytesIO(content),
        metadata={
            "content_type": file.content_type,
            "original_filename": file.filename,
            "size": len(content),
        },
    )

    logger.info(f"Uploaded image: {fname} -> {file_id}")
    return str(file_id)


async def get_image(file_id: str) -> Optional[StreamingResponse]:
    """Retrieve an image from GridFS and return as StreamingResponse.
    
    Args:
        file_id: The GridFS file ID as string
        
    Returns:
        StreamingResponse with the image data, or None if not found
    """
    fs = get_fs_bucket()

    try:
        oid = ObjectId(file_id)
    except Exception:
        return None

    try:
        grid_out = await fs.open_download_stream(oid)
    except Exception:
        return None

    content_type = "image/jpeg"
    if grid_out.metadata and "content_type" in grid_out.metadata:
        content_type = grid_out.metadata["content_type"]

    async def stream_file():
        while True:
            chunk = await grid_out.read(8192)
            if not chunk:
                break
            yield chunk

    return StreamingResponse(
        stream_file(),
        media_type=content_type,
        headers={
            "Cache-Control": "public, max-age=31536000",  # 1 year cache
            "Content-Disposition": f"inline; filename={grid_out.filename}",
        },
    )


async def delete_image(file_id: str) -> bool:
    """Delete an image from GridFS.
    
    Args:
        file_id: The GridFS file ID as string
        
    Returns:
        True if deleted, False if not found
    """
    fs = get_fs_bucket()

    try:
        oid = ObjectId(file_id)
        await fs.delete(oid)
        logger.info(f"Deleted image: {file_id}")
        return True
    except Exception as e:
        logger.warning(f"Failed to delete image {file_id}: {e}")
        return False
