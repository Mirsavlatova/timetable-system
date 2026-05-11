from sqlalchemy import Column, Integer, String, Enum as SAEnum, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class SubjectType(str, enum.Enum):
    lecture = "lecture"
    lab = "lab"
    seminar = "seminar"
    computer_lab = "computer_lab"


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    subject_type = Column(SAEnum(SubjectType), nullable=False, default=SubjectType.lecture)
    weekly_hours = Column(Integer, nullable=False, default=2)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    slots = relationship("Slot", back_populates="subject")
