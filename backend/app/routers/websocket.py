import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.utils.security import decode_token
from app.models.user import User, UserRole
from app.services.notification_service import add_connection, remove_connection
from app.models.notification import Notification
from app.schemas.report import NotificationResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket):
    """WebSocket endpoint for admin real-time notifications.
    
    Requires JWT token as query parameter: /ws/notifications?token=<jwt>
    """
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=4001, reason="Token required")
        return

    try:
        payload = decode_token(token)
    except Exception:
        await websocket.close(code=4001, reason="Invalid token")
        return

    if payload.get("role") != "admin":
        await websocket.close(code=4003, reason="Admin access required")
        return

    await websocket.accept()
    await add_connection(websocket)

    # Send unread notification count on connect
    unread = await Notification.find(Notification.is_read == False).count()
    await websocket.send_json({"type": "unread_count", "count": unread})

    try:
        while True:
            # Keep connection alive, handle client messages
            data = await websocket.receive_text()

            if data == "mark_all_read":
                await Notification.find(Notification.is_read == False).update(
                    {"$set": {"is_read": True}}
                )
                await websocket.send_json({"type": "unread_count", "count": 0})

    except WebSocketDisconnect:
        await remove_connection(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await remove_connection(websocket)
