from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.dependencies import get_current_user, get_admin_or_dispatcher
from app.crud.crud import crud_slot
from app.schemas.slot import SlotOut
from app.services.timetable_generator import generate_timetable

router = APIRouter(prefix="/timetable", tags=["timetable"])


@router.get("/group/{group_id}", response_model=List[SlotOut])
def timetable_by_group(
    group_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)
):
    return crud_slot.get_by_group(db, group_id)


@router.get("/teacher/{teacher_id}", response_model=List[SlotOut])
def timetable_by_teacher(
    teacher_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)
):
    return crud_slot.get_by_teacher(db, teacher_id)


@router.get("/room/{room_id}", response_model=List[SlotOut])
def timetable_by_room(
    room_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)
):
    return crud_slot.get_by_room(db, room_id)


@router.post("/generate")
def auto_generate_timetable(
    db: Session = Depends(get_db),
    _=Depends(get_admin_or_dispatcher),
):
    result = generate_timetable(db)
    return result
