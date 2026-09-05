import asyncio
import json
import logging
from typing import Set

from fastapi import WebSocket

from app.models.notification import Notification, NotificationType

logger = logging.getLogger(__name__)

# Active admin WebSocket connections
active_connections: Set[WebSocket] = set()


async def add_connection(websocket: WebSocket):
    """Add an admin WebSocket connection."""
    active_connections.add(websocket)
    logger.info(f"Admin WebSocket connected. Total: {len(active_connections)}")


async def remove_connection(websocket: WebSocket):
    """Remove an admin WebSocket connection."""
    active_connections.discard(websocket)
    logger.info(f"Admin WebSocket disconnected. Total: {len(active_connections)}")


async def broadcast(message: dict):
    """Broadcast a message to all connected admin clients."""
    if not active_connections:
        return

    payload = json.dumps(message)
    disconnected = set()

    for ws in active_connections:
        try:
            await ws.send_text(payload)
        except Exception:
            disconnected.add(ws)

    # Clean up disconnected clients
    for ws in disconnected:
        active_connections.discard(ws)


async def create_notification(
    notification_type: NotificationType,
    entity_id: str,
    message: str,
) -> Notification:
    """Create a notification and broadcast to admin clients."""
    notification = Notification(
        type=notification_type,
        entity_id=entity_id,
        message=message,
    )
    await notification.insert()

    # Broadcast to connected admins
    await broadcast({
        "type": "notification",
        "data": {
            "id": str(notification.id),
            "type": notification.type.value,
            "entity_id": notification.entity_id,
            "message": notification.message,
            "created_at": notification.created_at.isoformat(),
        },
    })

    return notification


async def get_unread_count() -> int:
    """Get count of unread notifications."""
    return await Notification.find(Notification.is_read == False).count()


async def mark_as_read(notification_id: str) -> bool:
    """Mark a notification as read."""
    notification = await Notification.get(notification_id)
    if notification:
        notification.is_read = True
        await notification.save()
        return True
    return False


async def mark_all_as_read():
    """Mark all notifications as read."""
    await Notification.find(Notification.is_read == False).update(
        {"$set": {"is_read": True}}
    )
