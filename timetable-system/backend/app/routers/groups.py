from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, get_admin_or_dispatcher
from app.crud.crud import crud_group
from app.schemas.group import GroupCreate, GroupUpdate, GroupOut

router = APIRouter(prefix="/groups", tags=["groups"])


@router.get("/", response_model=List[GroupOut])
def list_groups(
    skip: int = 0, limit: int = 100,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    if search:
        return crud_group.search(db, search)
    return crud_group.get_all(db, skip, limit)


@router.get("/{group_id}", response_model=GroupOut)
def get_group(group_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    g = crud_group.get(db, group_id)
    if not g:
        raise HTTPException(404, "Guruh topilmadi")
    return g


@router.post("/", response_model=GroupOut)
def create_group(
    data: GroupCreate, db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    return crud_group.create(db, data)


@router.put("/{group_id}", response_model=GroupOut)
def update_group(
    group_id: int, data: GroupUpdate,
    db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    g = crud_group.get(db, group_id)
    if not g:
        raise HTTPException(404, "Guruh topilmadi")
    return crud_group.update(db, g, data)


@router.delete("/{group_id}")
def delete_group(
    group_id: int, db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    g = crud_group.delete(db, group_id)
    if not g:
        raise HTTPException(404, "Guruh topilmadi")
    return {"message": "Guruh o'chirildi"}
