from sqlalchemy.orm import Session
from datetime import time
from typing import List
import itertools
from app.models.teacher import Teacher, TeacherAvailability
from app.models.subject import Subject
from app.models.group import StudentGroup
from app.models.room import Room, RoomStatus
from app.models.slot import Slot, SlotStatus, WeekType
from app.services.conflict_checker import check_slot_conflicts

# Standard time slots
TIME_SLOTS = [
    (time(8, 0), time(9, 30)),
    (time(9, 45), time(11, 15)),
    (time(11, 30), time(13, 0)),
    (time(13, 30), time(15, 0)),
    (time(15, 15), time(16, 45)),
    (time(17, 0), time(18, 30)),
]
DAYS = list(range(5))  # Mon-Fri


def generate_timetable(db: Session) -> dict:
    """Auto-generate timetable slots."""
    subjects = db.query(Subject).all()
    teachers = db.query(Teacher).all()
    groups = db.query(StudentGroup).all()
    rooms = db.query(Room).filter(Room.status == RoomStatus.active).all()

    created = 0
    skipped = 0
    results = []

    # Simple round-robin assignment per group
    # Each group needs each subject weekly_hours/2 times per week (each slot = 1.5h)
    for group in groups:
        for subject in subjects:
            slots_needed = max(1, subject.weekly_hours // 2)
            placed = 0

            # Find teachers (for simplicity, assign any available teacher)
            for teacher in teachers:
                if placed >= slots_needed:
                    break

                for day in DAYS:
                    if placed >= slots_needed:
                        break

                    # Check teacher availability for this day
                    avail = db.query(TeacherAvailability).filter(
                        TeacherAvailability.teacher_id == teacher.id,
                        TeacherAvailability.day_of_week == day,
                    ).first()
                    if not avail:
                        continue

                    for start, end in TIME_SLOTS:
                        if placed >= slots_needed:
                            break
                        # Check time within teacher availability
                        if not (avail.start_time <= start and avail.end_time >= end):
                            continue

                        # Find a suitable room
                        suitable_room = None
                        for room in rooms:
                            if room.room_type.value != subject.subject_type.value:
                                continue
                            if room.capacity < group.student_count:
                                continue

                            errors = check_slot_conflicts(
                                db, subject.id, teacher.id, group.id, room.id,
                                day, start, end, "all"
                            )
                            if not errors:
                                suitable_room = room
                                break

                        if suitable_room:
                            slot = Slot(
                                subject_id=subject.id,
                                teacher_id=teacher.id,
                                group_id=group.id,
                                room_id=suitable_room.id,
                                day_of_week=day,
                                start_time=start,
                                end_time=end,
                                week_type=WeekType.all,
                                status=SlotStatus.active,
                            )
                            db.add(slot)
                            db.flush()
                            placed += 1
                            created += 1
                            results.append({
                                "group": group.name,
                                "subject": subject.name,
                                "teacher": f"{teacher.first_name} {teacher.last_name}",
                                "room": suitable_room.name,
                                "day": day,
                                "start": str(start),
                                "end": str(end),
                            })

            if placed < slots_needed:
                skipped += 1

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e), "created": 0, "skipped": skipped}

    return {"success": True, "created": created, "skipped": skipped, "slots": results}
