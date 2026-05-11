from sqlalchemy.orm import Session
from typing import Optional, List
from app.crud.base import CRUDBase
from app.models.user import User
from app.models.teacher import Teacher, TeacherAvailability
from app.models.subject import Subject
from app.models.group import StudentGroup
from app.models.room import Room, Equipment, RoomEquipment
from app.models.slot import Slot
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.core.security import get_password_hash


# ─── User ───────────────────────────────────────────────────────────────────
class CRUDUser(CRUDBase):
    def get_by_username(self, db: Session, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def create_user(self, db: Session, username: str, email: str, password: str, role: str) -> User:
        user = User(
            username=username,
            email=email,
            hashed_password=get_password_hash(password),
            role=role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


crud_user = CRUDUser(User)


# ─── Teacher ─────────────────────────────────────────────────────────────────
class CRUDTeacher(CRUDBase):
    def get_by_email(self, db: Session, email: str) -> Optional[Teacher]:
        return db.query(Teacher).filter(Teacher.email == email).first()

    def search(self, db: Session, q: str) -> List[Teacher]:
        return db.query(Teacher).filter(
            (Teacher.first_name.ilike(f"%{q}%")) |
            (Teacher.last_name.ilike(f"%{q}%")) |
            (Teacher.department.ilike(f"%{q}%"))
        ).all()

    def get_availabilities(self, db: Session, teacher_id: int) -> List[TeacherAvailability]:
        return db.query(TeacherAvailability).filter(
            TeacherAvailability.teacher_id == teacher_id
        ).all()

    def set_availabilities(self, db: Session, teacher_id: int, availabilities: list) -> List[TeacherAvailability]:
        db.query(TeacherAvailability).filter(
            TeacherAvailability.teacher_id == teacher_id
        ).delete()
        new_avails = []
        for a in availabilities:
            obj = TeacherAvailability(teacher_id=teacher_id, **a.model_dump())
            db.add(obj)
            new_avails.append(obj)
        db.commit()
        return new_avails


crud_teacher = CRUDTeacher(Teacher)


# ─── Subject ─────────────────────────────────────────────────────────────────
class CRUDSubject(CRUDBase):
    def get_by_code(self, db: Session, code: str) -> Optional[Subject]:
        return db.query(Subject).filter(Subject.code == code).first()

    def search(self, db: Session, q: str) -> List[Subject]:
        return db.query(Subject).filter(
            (Subject.name.ilike(f"%{q}%")) | (Subject.code.ilike(f"%{q}%"))
        ).all()


crud_subject = CRUDSubject(Subject)


# ─── Group ───────────────────────────────────────────────────────────────────
class CRUDGroup(CRUDBase):
    def search(self, db: Session, q: str) -> List[StudentGroup]:
        return db.query(StudentGroup).filter(
            (StudentGroup.name.ilike(f"%{q}%")) | (StudentGroup.faculty.ilike(f"%{q}%"))
        ).all()


crud_group = CRUDGroup(StudentGroup)


# ─── Room ────────────────────────────────────────────────────────────────────
class CRUDRoom(CRUDBase):
    def search(self, db: Session, q: str) -> List[Room]:
        return db.query(Room).filter(
            (Room.name.ilike(f"%{q}%")) | (Room.building.ilike(f"%{q}%"))
        ).all()

    def add_equipment(self, db: Session, room_id: int, equipment_id: int, quantity: int = 1):
        existing = db.query(RoomEquipment).filter(
            RoomEquipment.room_id == room_id,
            RoomEquipment.equipment_id == equipment_id,
        ).first()
        if existing:
            existing.quantity = quantity
        else:
            obj = RoomEquipment(room_id=room_id, equipment_id=equipment_id, quantity=quantity)
            db.add(obj)
        db.commit()

    def remove_equipment(self, db: Session, room_id: int, equipment_id: int):
        db.query(RoomEquipment).filter(
            RoomEquipment.room_id == room_id,
            RoomEquipment.equipment_id == equipment_id,
        ).delete()
        db.commit()


crud_room = CRUDRoom(Room)
crud_equipment = CRUDBase(Equipment)


# ─── Slot ────────────────────────────────────────────────────────────────────
class CRUDSlot(CRUDBase):
    def get_by_group(self, db: Session, group_id: int) -> List[Slot]:
        return db.query(Slot).filter(Slot.group_id == group_id).all()

    def get_by_teacher(self, db: Session, teacher_id: int) -> List[Slot]:
        return db.query(Slot).filter(Slot.teacher_id == teacher_id).all()

    def get_by_room(self, db: Session, room_id: int) -> List[Slot]:
        return db.query(Slot).filter(Slot.room_id == room_id).all()


crud_slot = CRUDSlot(Slot)


# ─── Notification ────────────────────────────────────────────────────────────
class CRUDNotification(CRUDBase):
    def get_unread(self, db: Session) -> List[Notification]:
        return db.query(Notification).filter(Notification.is_read == False).order_by(Notification.created_at.desc()).all()

    def get_all_ordered(self, db: Session, skip: int = 0, limit: int = 50) -> List[Notification]:
        return db.query(Notification).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    def mark_read(self, db: Session, ids: List[int]):
        db.query(Notification).filter(Notification.id.in_(ids)).update(
            {"is_read": True}, synchronize_session=False
        )
        db.commit()


crud_notification = CRUDNotification(Notification)


# ─── AuditLog ────────────────────────────────────────────────────────────────
class CRUDAuditLog(CRUDBase):
    def get_all_ordered(self, db: Session, skip: int = 0, limit: int = 100) -> List[AuditLog]:
        return db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

    def create_log(self, db: Session, user_id: int, action: str, entity_type: str,
                   entity_id: int = None, old_values: str = None, new_values: str = None,
                   description: str = None):
        log = AuditLog(
            user_id=user_id, action=action, entity_type=entity_type,
            entity_id=entity_id, old_values=old_values, new_values=new_values,
            description=description,
        )
        db.add(log)
        db.commit()
        return log


crud_audit = CRUDAuditLog(AuditLog)
