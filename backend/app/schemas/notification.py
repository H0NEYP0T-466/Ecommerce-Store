from datetime import datetime
from typing import List
from pydantic import BaseModel
from app.models.notification import NotificationType


class NotificationResponse(BaseModel):
    id: str
    type: NotificationType
    entity_id: str
    message: str
    is_read: bool
    created_at: datetime


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int
