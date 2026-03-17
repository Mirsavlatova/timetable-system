import json
from sqlalchemy.orm import Session
from app.models.room import Room, RoomStatus
from app.models.slot import Slot, SlotStatus
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.services.conflict_checker import find_available_rooms


def handle_room_critical(db: Session, room_id: int, user_id: int = None) -> dict:
    """When room becomes critical, attempt to relocate all its slots."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        return {"error": "Room not found"}

    slots = db.query(Slot).filter(
        Slot.room_id == room_id,
        Slot.status == SlotStatus.active
    ).all()

    relocated = []
    requires_action = []

    for slot in slots:
        # Find alternative room
        alternatives = find_available_rooms(
            db,
            slot.subject_id,
            slot.group_id,
            slot.day_of_week,
            slot.start_time,
            slot.end_time,
            slot.week_type.value,
        )
        # Exclude current room
        alternatives = [r for r in alternatives if r.id != room_id]

        if alternatives:
            new_room = alternatives[0]
            old_room_id = slot.room_id
            slot.room_id = new_room.id

            # Notification
            notif = Notification(
                title="Slot ko'chirildi",
                message=f"Slot #{slot.id} ({room.name} → {new_room.name}) muvaffaqiyatli ko'chirildi.",
                notification_type="warning",
                related_slot_id=slot.id,
            )
            db.add(notif)

            # Audit log
            audit = AuditLog(
                user_id=user_id,
                action="relocate",
                entity_type="slot",
                entity_id=slot.id,
                old_values=json.dumps({"room_id": old_room_id}),
                new_values=json.dumps({"room_id": new_room.id}),
                description=f"Room {room.name} critical bo'lganda slot ko'chirildi.",
            )
            db.add(audit)
            relocated.append({"slot_id": slot.id, "new_room": new_room.name})
        else:
            slot.status = SlotStatus.requires_action

            notif = Notification(
                title="Slot harakati talab qilinadi",
                message=f"Slot #{slot.id} uchun mos xona topilmadi. Qo'lda hal qilish kerak.",
                notification_type="error",
                related_slot_id=slot.id,
            )
            db.add(notif)
            requires_action.append({"slot_id": slot.id})

    # Audit room status change
    audit_room = AuditLog(
        user_id=user_id,
        action="status_change",
        entity_type="room",
        entity_id=room_id,
        old_values=json.dumps({"status": "active"}),
        new_values=json.dumps({"status": "critical"}),
        description=f"Xona {room.name} holati critical ga o'zgartirildi.",
    )
    db.add(audit_room)
    db.commit()

    return {
        "relocated": relocated,
        "requires_action": requires_action,
        "total_slots": len(slots),
    }
