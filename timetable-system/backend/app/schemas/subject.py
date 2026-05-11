from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.subject import SubjectType


class SubjectBase(BaseModel):
    name: str
    code: str
    subject_type: SubjectType = SubjectType.lecture
    weekly_hours: int = 2
    description: Optional[str] = None


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    subject_type: Optional[SubjectType] = None
    weekly_hours: Optional[int] = None
    description: Optional[str] = None


class SubjectOut(SubjectBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
