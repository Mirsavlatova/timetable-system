from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class GroupBase(BaseModel):
    name: str
    faculty: Optional[str] = None
    semester: int = 1
    student_count: int = 25
    academic_year: Optional[str] = None


class GroupCreate(GroupBase):
    pass


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    faculty: Optional[str] = None
    semester: Optional[int] = None
    student_count: Optional[int] = None
    academic_year: Optional[str] = None


class GroupOut(GroupBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
