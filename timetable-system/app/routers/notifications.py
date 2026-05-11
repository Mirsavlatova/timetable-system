from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.crud.crud import crud_notification, crud_audit
from app.schemas.notification import NotificationOut, NotificationMarkRead, AuditLogOut

notif_router = APIRouter(prefix="/notifications", tags=["notifications"])
audit_router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@notif_router.get("/", response_model=List[NotificationOut])
def list_notifications(
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return crud_notification.get_all_ordered(db, skip, limit)


@notif_router.patch("/mark-read")
def mark_notifications_read(
    data: NotificationMarkRead,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    crud_notification.mark_read(db, data.ids)
    return {"message": f"{len(data.ids)} ta bildirishnoma o'qildi deb belgilandi"}


@audit_router.get("/", response_model=List[AuditLogOut])
def list_audit_logs(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return crud_audit.get_all_ordered(db, skip, limit)
