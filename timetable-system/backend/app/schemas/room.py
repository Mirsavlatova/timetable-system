from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.room import RoomType, RoomStatus


class EquipmentBase(BaseModel):
    name: str
    description: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    pass


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class EquipmentOut(EquipmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RoomEquipmentItem(BaseModel):
    equipment_id: int
    quantity: int = 1


class RoomEquipmentOut(BaseModel):
    id: int
    equipment_id: int
    quantity: int
    equipment: EquipmentOut

    class Config:
        from_attributes = True


class RoomBase(BaseModel):
    name: str
    building: Optional[str] = None
    floor: Optional[int] = None
    capacity: int = 30
    room_type: RoomType = RoomType.lecture
    status: RoomStatus = RoomStatus.active


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    name: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[int] = None
    capacity: Optional[int] = None
    room_type: Optional[RoomType] = None
    status: Optional[RoomStatus] = None


class RoomOut(RoomBase):
    id: int
    created_at: datetime
    equipments: List[RoomEquipmentOut] = []

    class Config:
        from_attributes = True


class RoomListOut(RoomBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
