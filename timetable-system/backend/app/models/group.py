from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class StudentGroup(Base):
    __tablename__ = "student_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    faculty = Column(String(150), nullable=True)
    semester = Column(Integer, nullable=False, default=1)
    student_count = Column(Integer, nullable=False, default=25)
    academic_year = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    slots = relationship("Slot", back_populates="group")
