from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.dependencies import get_current_user, get_admin_or_dispatcher
from app.crud.crud import crud_slot
from app.models.slot import Slot, SlotStatus
from app.schemas.slot import SlotCreate, SlotUpdate, SlotOut, SlotDragDrop, SlotCreateResponse
from app.services.conflict_checker import check_slot_conflicts, find_available_rooms

router = APIRouter(prefix="/slots", tags=["slots"])


@router.get("/", response_model=List[SlotOut])
def list_slots(
    skip: int = 0, limit: int = 200,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return crud_slot.get_all(db, skip, limit)


@router.get("/{slot_id}", response_model=SlotOut)
def get_slot(slot_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    s = crud_slot.get(db, slot_id)
    if not s:
        raise HTTPException(404, "Slot topilmadi")
    return s


@router.post("/", response_model=SlotCreateResponse)
def create_slot(
    data: SlotCreate,
    db: Session = Depends(get_db),
    _=Depends(get_admin_or_dispatcher),
):
    errors = check_slot_conflicts(
        db, data.subject_id, data.teacher_id, data.group_id, data.room_id,
        data.day_of_week, data.start_time, data.end_time, data.week_type.value
    )
    if errors:
        # Attach suggested rooms for room-related conflicts
        for err in errors:
            if err.conflict_type in ("room_busy", "room_type_mismatch", "room_capacity"):
                err.suggested_rooms = find_available_rooms(
                    db, data.subject_id, data.group_id,
                    data.day_of_week, data.start_time, data.end_time, data.week_type.value
                )
        return SlotCreateResponse(success=False, errors=errors)

    slot = Slot(**data.model_dump())
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return SlotCreateResponse(success=True, slot=SlotOut.model_validate(slot))


@router.put("/{slot_id}", response_model=SlotCreateResponse)
def update_slot(
    slot_id: int, data: SlotUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_admin_or_dispatcher),
):
    slot = crud_slot.get(db, slot_id)
    if not slot:
        raise HTTPException(404, "Slot topilmadi")

    # Merge current + new values for conflict check
    subject_id = data.subject_id or slot.subject_id
    teacher_id = data.teacher_id or slot.teacher_id
    group_id = data.group_id or slot.group_id
    room_id = data.room_id or slot.room_id
    day = data.day_of_week if data.day_of_week is not None else slot.day_of_week
    start = data.start_time or slot.start_time
    end = data.end_time or slot.end_time
    week_type = data.week_type.value if data.week_type else slot.week_type.value

    errors = check_slot_conflicts(
        db, subject_id, teacher_id, group_id, room_id,
        day, start, end, week_type, exclude_slot_id=slot_id
    )
    if errors:
        for err in errors:
            if err.conflict_type in ("room_busy", "room_type_mismatch", "room_capacity"):
                err.suggested_rooms = find_available_rooms(
                    db, subject_id, group_id, day, start, end, week_type
                )
        return SlotCreateResponse(success=False, errors=errors)

    updated = crud_slot.update(db, slot, data)
    return SlotCreateResponse(success=True, slot=SlotOut.model_validate(updated))


@router.delete("/{slot_id}")
def delete_slot(
    slot_id: int, db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    s = crud_slot.delete(db, slot_id)
    if not s:
        raise HTTPException(404, "Slot topilmadi")
    return {"message": "Slot o'chirildi"}


@router.patch("/{slot_id}/drag-drop", response_model=SlotCreateResponse)
def drag_drop_slot(
    slot_id: int,
    data: SlotDragDrop,
    db: Session = Depends(get_db),
    _=Depends(get_admin_or_dispatcher),
):
    slot = crud_slot.get(db, slot_id)
    if not slot:
        raise HTTPException(404, "Slot topilmadi")

    errors = check_slot_conflicts(
        db, slot.subject_id, slot.teacher_id, slot.group_id, data.room_id,
        data.day_of_week, data.start_time, data.end_time,
        slot.week_type.value, exclude_slot_id=slot_id
    )
    if errors:
        for err in errors:
            if err.conflict_type in ("room_busy", "room_type_mismatch", "room_capacity"):
                err.suggested_rooms = find_available_rooms(
                    db, slot.subject_id, slot.group_id,
                    data.day_of_week, data.start_time, data.end_time, slot.week_type.value
                )
        return SlotCreateResponse(success=False, errors=errors)

    slot.day_of_week = data.day_of_week
    slot.start_time = data.start_time
    slot.end_time = data.end_time
    slot.room_id = data.room_id
    db.commit()
    db.refresh(slot)
    return SlotCreateResponse(success=True, slot=SlotOut.model_validate(slot))
