from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, time


class TeacherAvailabilityBase(BaseModel):
    day_of_week: int  # 0=Monday
    start_time: time
    end_time: time


class TeacherAvailabilityCreate(TeacherAvailabilityBase):
    pass


class TeacherAvailabilityOut(TeacherAvailabilityBase):
    id: int
    teacher_id: int

    class Config:
        from_attributes = True


class TeacherBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    department: Optional[str] = None


class TeacherCreate(TeacherBase):
    user_id: Optional[int] = None


class TeacherUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department: Optional[str] = None


class TeacherOut(TeacherBase):
    id: int
    user_id: Optional[int]
    created_at: datetime
    availabilities: List[TeacherAvailabilityOut] = []

    class Config:
        from_attributes = True


class TeacherListOut(TeacherBase):
    id: int
    user_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
