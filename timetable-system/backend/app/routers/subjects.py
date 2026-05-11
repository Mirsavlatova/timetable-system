from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, get_admin_or_dispatcher
from app.crud.crud import crud_subject
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectOut

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.get("/", response_model=List[SubjectOut])
def list_subjects(
    skip: int = 0, limit: int = 100,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    if search:
        return crud_subject.search(db, search)
    return crud_subject.get_all(db, skip, limit)


@router.get("/{subject_id}", response_model=SubjectOut)
def get_subject(subject_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    s = crud_subject.get(db, subject_id)
    if not s:
        raise HTTPException(404, "Fan topilmadi")
    return s


@router.post("/", response_model=SubjectOut)
def create_subject(
    data: SubjectCreate, db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    if crud_subject.get_by_code(db, data.code):
        raise HTTPException(400, "Bu kod allaqachon mavjud")
    return crud_subject.create(db, data)


@router.put("/{subject_id}", response_model=SubjectOut)
def update_subject(
    subject_id: int, data: SubjectUpdate,
    db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    s = crud_subject.get(db, subject_id)
    if not s:
        raise HTTPException(404, "Fan topilmadi")
    return crud_subject.update(db, s, data)


@router.delete("/{subject_id}")
def delete_subject(
    subject_id: int, db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    s = crud_subject.delete(db, subject_id)
    if not s:
        raise HTTPException(404, "Fan topilmadi")
    return {"message": "Fan o'chirildi"}
