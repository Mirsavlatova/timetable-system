from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, get_admin_or_dispatcher
from app.crud.crud import crud_teacher
from app.schemas.teacher import (
    TeacherCreate, TeacherUpdate, TeacherOut, TeacherListOut,
    TeacherAvailabilityCreate, TeacherAvailabilityOut,
)

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("/", response_model=List[TeacherListOut])
def list_teachers(
    skip: int = 0, limit: int = 100,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    if search:
        return crud_teacher.search(db, search)
    return crud_teacher.get_all(db, skip, limit)


@router.get("/{teacher_id}", response_model=TeacherOut)
def get_teacher(teacher_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    t = crud_teacher.get(db, teacher_id)
    if not t:
        raise HTTPException(404, "O'qituvchi topilmadi")
    return t


@router.post("/", response_model=TeacherOut)
def create_teacher(
    data: TeacherCreate,
    db: Session = Depends(get_db),
    _=Depends(get_admin_or_dispatcher),
):
    if crud_teacher.get_by_email(db, data.email):
        raise HTTPException(400, "Bu email allaqachon ro'yxatdan o'tgan")
    from app.models.teacher import Teacher
    t = Teacher(**data.model_dump())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.put("/{teacher_id}", response_model=TeacherOut)
def update_teacher(
    teacher_id: int, data: TeacherUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_admin_or_dispatcher),
):
    t = crud_teacher.get(db, teacher_id)
    if not t:
        raise HTTPException(404, "O'qituvchi topilmadi")
    return crud_teacher.update(db, t, data)


@router.delete("/{teacher_id}")
def delete_teacher(
    teacher_id: int, db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    t = crud_teacher.delete(db, teacher_id)
    if not t:
        raise HTTPException(404, "O'qituvchi topilmadi")
    return {"message": "O'qituvchi o'chirildi"}


# ─── Teacher Availability ─────────────────────────────────────────────────────
@router.get("/{teacher_id}/availability", response_model=List[TeacherAvailabilityOut])
def get_availability(teacher_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud_teacher.get_availabilities(db, teacher_id)


@router.put("/{teacher_id}/availability", response_model=List[TeacherAvailabilityOut])
def set_availability(
    teacher_id: int,
    data: List[TeacherAvailabilityCreate],
    db: Session = Depends(get_db),
    _=Depends(get_admin_or_dispatcher),
):
    t = crud_teacher.get(db, teacher_id)
    if not t:
        raise HTTPException(404, "O'qituvchi topilmadi")
    avails = crud_teacher.set_availabilities(db, teacher_id, data)
    db.refresh(t)
    return t.availabilities
