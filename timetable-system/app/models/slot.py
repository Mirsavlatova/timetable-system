from sqlalchemy import Column, Integer, ForeignKey, Time, Enum as SAEnum, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class WeekType(str, enum.Enum):
    all = "all"
    odd = "odd"
    even = "even"


class SlotStatus(str, enum.Enum):
    active = "active"
    cancelled = "cancelled"
    requires_action = "requires_action"


class Slot(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("student_groups.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    week_type = Column(SAEnum(WeekType), nullable=False, default=WeekType.all)
    status = Column(SAEnum(SlotStatus), nullable=False, default=SlotStatus.active)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    subject = relationship("Subject", back_populates="slots")
    teacher = relationship("Teacher", back_populates="slots")
    group = relationship("StudentGroup", back_populates="slots")
    room = relationship("Room", back_populates="slots")
    notifications = relationship("Notification", back_populates="related_slot")
