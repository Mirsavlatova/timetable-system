from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, get_admin_or_dispatcher
from app.crud.crud import crud_room, crud_equipment
from app.schemas.room import (
    RoomCreate, RoomUpdate, RoomOut, RoomListOut,
    EquipmentCreate, EquipmentUpdate, EquipmentOut, RoomEquipmentItem,
)
from app.services.room_service import handle_room_critical
from app.models.room import RoomStatus

router = APIRouter(prefix="/rooms", tags=["rooms"])
equip_router = APIRouter(prefix="/equipment", tags=["equipment"])


# ─── Rooms ────────────────────────────────────────────────────────────────────
@router.get("/", response_model=List[RoomListOut])
def list_rooms(
    skip: int = 0, limit: int = 100,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    if search:
        return crud_room.search(db, search)
    return crud_room.get_all(db, skip, limit)


@router.get("/{room_id}", response_model=RoomOut)
def get_room(room_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    r = crud_room.get(db, room_id)
    if not r:
        raise HTTPException(404, "Xona topilmadi")
    return r


@router.post("/", response_model=RoomOut)
def create_room(
    data: RoomCreate, db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    return crud_room.create(db, data)


@router.put("/{room_id}", response_model=RoomOut)
def update_room(
    room_id: int, data: RoomUpdate,
    db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    r = crud_room.get(db, room_id)
    if not r:
        raise HTTPException(404, "Xona topilmadi")
    return crud_room.update(db, r, data)


@router.delete("/{room_id}")
def delete_room(
    room_id: int, db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    r = crud_room.delete(db, room_id)
    if not r:
        raise HTTPException(404, "Xona topilmadi")
    return {"message": "Xona o'chirildi"}


@router.patch("/{room_id}/status")
def update_room_status(
    room_id: int,
    status: RoomStatus,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_or_dispatcher),
):
    r = crud_room.get(db, room_id)
    if not r:
        raise HTTPException(404, "Xona topilmadi")
    r.status = status
    db.commit()
    result = {"room_id": room_id, "status": status}
    if status == RoomStatus.critical:
        relocation = handle_room_critical(db, room_id, current_user.id)
        result["relocation"] = relocation
    return result


@router.post("/{room_id}/equipment")
def add_room_equipment(
    room_id: int, data: RoomEquipmentItem,
    db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    r = crud_room.get(db, room_id)
    if not r:
        raise HTTPException(404, "Xona topilmadi")
    crud_room.add_equipment(db, room_id, data.equipment_id, data.quantity)
    return {"message": "Jihozlar qo'shildi"}


@router.delete("/{room_id}/equipment/{equipment_id}")
def remove_room_equipment(
    room_id: int, equipment_id: int,
    db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    crud_room.remove_equipment(db, room_id, equipment_id)
    return {"message": "Jihozlar o'chirildi"}


# ─── Equipment ────────────────────────────────────────────────────────────────
@equip_router.get("/", response_model=List[EquipmentOut])
def list_equipment(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud_equipment.get_all(db)


@equip_router.get("/{eq_id}", response_model=EquipmentOut)
def get_equipment(eq_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    eq = crud_equipment.get(db, eq_id)
    if not eq:
        raise HTTPException(404, "Jihoz topilmadi")
    return eq


@equip_router.post("/", response_model=EquipmentOut)
def create_equipment(
    data: EquipmentCreate, db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    return crud_equipment.create(db, data)


@equip_router.put("/{eq_id}", response_model=EquipmentOut)
def update_equipment(
    eq_id: int, data: EquipmentUpdate,
    db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    eq = crud_equipment.get(db, eq_id)
    if not eq:
        raise HTTPException(404, "Jihoz topilmadi")
    return crud_equipment.update(db, eq, data)


@equip_router.delete("/{eq_id}")
def delete_equipment(
    eq_id: int, db: Session = Depends(get_db), _=Depends(get_admin_or_dispatcher)
):
    eq = crud_equipment.delete(db, eq_id)
    if not eq:
        raise HTTPException(404, "Jihoz topilmadi")
    return {"message": "Jihoz o'chirildi"}
