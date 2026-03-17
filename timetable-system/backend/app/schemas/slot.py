from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, time
from app.models.slot import SlotStatus, WeekType
from app.schemas.teacher import TeacherListOut
from app.schemas.subject import SubjectOut
from app.schemas.group import GroupOut
from app.schemas.room import RoomListOut


class SlotBase(BaseModel):
    subject_id: int
    teacher_id: int
    group_id: int
    room_id: int
    day_of_week: int
    start_time: time
    end_time: time
    week_type: WeekType = WeekType.all


class SlotCreate(SlotBase):
    pass


class SlotUpdate(BaseModel):
    subject_id: Optional[int] = None
    teacher_id: Optional[int] = None
    group_id: Optional[int] = None
    room_id: Optional[int] = None
    day_of_week: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    week_type: Optional[WeekType] = None
    status: Optional[SlotStatus] = None


class SlotDragDrop(BaseModel):
    day_of_week: int
    start_time: time
    end_time: time
    room_id: int


class SlotOut(SlotBase):
    id: int
    status: SlotStatus
    created_at: datetime
    updated_at: Optional[datetime]
    subject: SubjectOut
    teacher: TeacherListOut
    group: GroupOut
    room: RoomListOut

    class Config:
        from_attributes = True


class ConflictError(BaseModel):
    conflict_type: str
    message: str
    suggested_rooms: Optional[List[RoomListOut]] = None


class SlotCreateResponse(BaseModel):
    success: bool
    slot: Optional[SlotOut] = None
    errors: Optional[List[ConflictError]] = None
