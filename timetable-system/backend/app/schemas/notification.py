from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    related_slot_id: Optional[int]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationMarkRead(BaseModel):
    ids: list[int]


class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    entity_type: str
    entity_id: Optional[int]
    old_values: Optional[str]
    new_values: Optional[str]
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
