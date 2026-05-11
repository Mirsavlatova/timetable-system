from sqlalchemy.orm import Session
from datetime import time
from typing import List, Optional, Tuple
from app.models.slot import Slot, SlotStatus
from app.models.room import Room, RoomStatus
from app.models.teacher import Teacher, TeacherAvailability
from app.schemas.slot import ConflictError


def times_overlap(s1: time, e1: time, s2: time, e2: time) -> bool:
    """Check if two time ranges overlap."""
    return s1 < e2 and e1 > s2


def check_slot_conflicts(
    db: Session,
    subject_id: int,
    teacher_id: int,
    group_id: int,
    room_id: int,
    day_of_week: int,
    start_time: time,
    end_time: time,
    week_type: str,
    exclude_slot_id: Optional[int] = None,
) -> List[ConflictError]:
    errors: List[ConflictError] = []

    # Base query for conflicting slots (same day, overlapping time)
    base_q = (
        db.query(Slot)
        .filter(
            Slot.day_of_week == day_of_week,
            Slot.status != SlotStatus.cancelled,
        )
    )
    if exclude_slot_id:
        base_q = base_q.filter(Slot.id != exclude_slot_id)

    existing_slots = base_q.all()
    overlapping = [
        s for s in existing_slots
        if times_overlap(start_time, end_time, s.start_time, s.end_time)
        and (week_type == "all" or s.week_type == "all" or s.week_type == week_type)
    ]

    # 1) Room conflict
    room_conflict = [s for s in overlapping if s.room_id == room_id]
    if room_conflict:
        errors.append(ConflictError(
            conflict_type="room_busy",
            message=f"Bu xona ({room_id}) tanlangan vaqtda band."
        ))

    # 2) Teacher conflict
    teacher_conflict = [s for s in overlapping if s.teacher_id == teacher_id]
    if teacher_conflict:
        errors.append(ConflictError(
            conflict_type="teacher_busy",
            message=f"O'qituvchi ({teacher_id}) tanlangan vaqtda boshqa darsda."
        ))

    # 3) Group conflict
    group_conflict = [s for s in overlapping if s.group_id == group_id]
    if group_conflict:
        errors.append(ConflictError(
            conflict_type="group_busy",
            message=f"Guruh ({group_id}) tanlangan vaqtda boshqa darsda."
        ))

    # 4) Room capacity check
    room = db.query(Room).filter(Room.id == room_id).first()
    if room:
        from app.models.group import StudentGroup
        group = db.query(StudentGroup).filter(StudentGroup.id == group_id).first()
        if group and group.student_count > room.capacity:
            errors.append(ConflictError(
                conflict_type="room_capacity",
                message=f"Xona sig'imi ({room.capacity}) guruh hajmidan ({group.student_count}) kichik."
            ))

        # 5) Room type vs subject type check
        from app.models.subject import Subject
        subject = db.query(Subject).filter(Subject.id == subject_id).first()
        if subject and room.room_type.value != subject.subject_type.value:
            errors.append(ConflictError(
                conflict_type="room_type_mismatch",
                message=f"Xona turi ({room.room_type}) fan turi ({subject.subject_type}) ga mos emas."
            ))

    # 6) Teacher availability check
    availability = db.query(TeacherAvailability).filter(
        TeacherAvailability.teacher_id == teacher_id,
        TeacherAvailability.day_of_week == day_of_week,
    ).all()
    if availability:
        available = any(
            a.start_time <= start_time and a.end_time >= end_time
            for a in availability
        )
        if not available:
            errors.append(ConflictError(
                conflict_type="teacher_unavailable",
                message=f"O'qituvchi bu kunda/vaqtda mavjud emas."
            ))

    return errors


def find_available_rooms(
    db: Session,
    subject_id: int,
    group_id: int,
    day_of_week: int,
    start_time: time,
    end_time: time,
    week_type: str,
) -> List[Room]:
    from app.models.subject import Subject
    from app.models.group import StudentGroup

    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    group = db.query(StudentGroup).filter(StudentGroup.id == group_id).first()
    if not subject or not group:
        return []

    # Get busy room ids
    busy_slots = (
        db.query(Slot)
        .filter(
            Slot.day_of_week == day_of_week,
            Slot.status != SlotStatus.cancelled,
        )
        .all()
    )
    busy_room_ids = {
        s.room_id for s in busy_slots
        if times_overlap(start_time, end_time, s.start_time, s.end_time)
        and (week_type == "all" or s.week_type == "all" or s.week_type == week_type)
    }

    available_rooms = (
        db.query(Room)
        .filter(
            Room.status == RoomStatus.active,
            Room.room_type == subject.subject_type,
            Room.capacity >= group.student_count,
            ~Room.id.in_(busy_room_ids),
        )
        .all()
    )
    return available_rooms
