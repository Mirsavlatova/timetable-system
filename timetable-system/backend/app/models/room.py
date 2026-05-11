from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SAEnum, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class RoomType(str, enum.Enum):
    lecture = "lecture"
    lab = "lab"
    seminar = "seminar"
    computer_lab = "computer_lab"


class RoomStatus(str, enum.Enum):
    active = "active"
    maintenance = "maintenance"
    critical = "critical"


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    building = Column(String(100), nullable=True)
    floor = Column(Integer, nullable=True)
    capacity = Column(Integer, nullable=False, default=30)
    room_type = Column(SAEnum(RoomType), nullable=False, default=RoomType.lecture)
    status = Column(SAEnum(RoomStatus), nullable=False, default=RoomStatus.active)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    equipments = relationship("RoomEquipment", back_populates="room", cascade="all, delete-orphan")
    slots = relationship("Slot", back_populates="room")


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    rooms = relationship("RoomEquipment", back_populates="equipment")


class RoomEquipment(Base):
    __tablename__ = "room_equipment"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False)
    quantity = Column(Integer, default=1)

    room = relationship("Room", back_populates="equipments")
    equipment = relationship("Equipment", back_populates="rooms")
