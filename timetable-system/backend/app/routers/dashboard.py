from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.crud.crud import crud_teacher, crud_subject, crud_group, crud_room, crud_slot, crud_notification
from app.models.slot import SlotStatus
from app.models.room import RoomStatus

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    total_slots = crud_slot.count(db)
    active_slots = db.query(__import__("app.models.slot", fromlist=["Slot"]).Slot).filter(
        __import__("app.models.slot", fromlist=["Slot"]).Slot.status == SlotStatus.active
    ).count()
    requires_action = db.query(__import__("app.models.slot", fromlist=["Slot"]).Slot).filter(
        __import__("app.models.slot", fromlist=["Slot"]).Slot.status == SlotStatus.requires_action
    ).count()
    critical_rooms = db.query(__import__("app.models.room", fromlist=["Room"]).Room).filter(
        __import__("app.models.room", fromlist=["Room"]).Room.status == RoomStatus.critical
    ).count()
    unread_notifs = db.query(__import__("app.models.notification", fromlist=["Notification"]).Notification).filter(
        __import__("app.models.notification", fromlist=["Notification"]).Notification.is_read == False
    ).count()

    return {
        "teachers": crud_teacher.count(db),
        "subjects": crud_subject.count(db),
        "groups": crud_group.count(db),
        "rooms": crud_room.count(db),
        "total_slots": total_slots,
        "active_slots": active_slots,
        "requires_action_slots": requires_action,
        "critical_rooms": critical_rooms,
        "unread_notifications": unread_notifs,
    }
