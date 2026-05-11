"""
Seed script - demo ma'lumotlarni yaratadi
Run: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import time
from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.teacher import Teacher, TeacherAvailability
from app.models.subject import Subject, SubjectType
from app.models.group import StudentGroup
from app.models.room import Room, Equipment, RoomEquipment, RoomType, RoomStatus
from app.models.slot import Slot, SlotStatus, WeekType

db = SessionLocal()


def clear_data():
    print("🗑  Eski ma'lumotlar tozalanmoqda...")
    from app.models.notification import Notification
    from app.models.audit_log import AuditLog
    db.query(Slot).delete()
    db.query(Notification).delete()
    db.query(AuditLog).delete()
    db.query(TeacherAvailability).delete()
    db.query(RoomEquipment).delete()
    db.query(Teacher).delete()
    db.query(Subject).delete()
    db.query(StudentGroup).delete()
    db.query(Room).delete()
    db.query(Equipment).delete()
    db.query(User).delete()
    db.commit()
    print("✅ Tozalandi")


def seed_users():
    print("👤 Foydalanuvchilar yaratilmoqda...")
    users = [
        User(username="admin", email="admin@university.uz",
             hashed_password=get_password_hash("admin123"), role=UserRole.admin),
        User(username="dispatcher", email="dispatcher@university.uz",
             hashed_password=get_password_hash("disp123"), role=UserRole.dispatcher),
        User(username="teacher1", email="teacher1@university.uz",
             hashed_password=get_password_hash("teach123"), role=UserRole.teacher),
        User(username="student1", email="student1@university.uz",
             hashed_password=get_password_hash("stud123"), role=UserRole.student),
    ]
    db.add_all(users)
    db.commit()
    print(f"✅ {len(users)} ta foydalanuvchi yaratildi")
    return users


def seed_equipment():
    print("🔧 Jihozlar yaratilmoqda...")
    items = [
        Equipment(name="Proyektor", description="Multimedia proyektor"),
        Equipment(name="Kompyuter", description="O'qituvchi kompyuteri"),
        Equipment(name="Doskasi", description="Interaktiv doska"),
        Equipment(name="Laboratoriya asboblari", description="Kimyo/fizika lab jihozlari"),
        Equipment(name="Mikroskop", description="Biologiya mikroskopi"),
    ]
    db.add_all(items)
    db.commit()
    print(f"✅ {len(items)} ta jihoz yaratildi")
    return items


def seed_rooms(equipment):
    print("🏛  Xonalar yaratilmoqda...")
    rooms = [
        Room(name="101-xona", building="A-korpus", floor=1, capacity=50, room_type=RoomType.lecture, status=RoomStatus.active),
        Room(name="102-xona", building="A-korpus", floor=1, capacity=40, room_type=RoomType.lecture, status=RoomStatus.active),
        Room(name="201-xona", building="A-korpus", floor=2, capacity=35, room_type=RoomType.seminar, status=RoomStatus.active),
        Room(name="202-xona", building="A-korpus", floor=2, capacity=30, room_type=RoomType.seminar, status=RoomStatus.active),
        Room(name="Lab-1", building="B-korpus", floor=1, capacity=25, room_type=RoomType.lab, status=RoomStatus.active),
        Room(name="Lab-2", building="B-korpus", floor=1, capacity=20, room_type=RoomType.lab, status=RoomStatus.active),
        Room(name="KompLab-1", building="B-korpus", floor=2, capacity=30, room_type=RoomType.computer_lab, status=RoomStatus.active),
        Room(name="KompLab-2", building="B-korpus", floor=2, capacity=25, room_type=RoomType.computer_lab, status=RoomStatus.active),
        Room(name="301-xona", building="A-korpus", floor=3, capacity=60, room_type=RoomType.lecture, status=RoomStatus.active),
        Room(name="302-xona", building="A-korpus", floor=3, capacity=45, room_type=RoomType.lecture, status=RoomStatus.active),
        Room(name="Amaliyot-1", building="C-korpus", floor=1, capacity=28, room_type=RoomType.seminar, status=RoomStatus.active),
        Room(name="Amaliyot-2", building="C-korpus", floor=1, capacity=28, room_type=RoomType.seminar, status=RoomStatus.active),
    ]
    db.add_all(rooms)
    db.flush()

    # Add equipment to rooms
    proj = equipment[0]
    comp = equipment[1]
    board = equipment[2]
    lab_eq = equipment[3]

    for room in rooms[:4]:  # Lecture rooms get projector + board
        db.add(RoomEquipment(room_id=room.id, equipment_id=proj.id, quantity=1))
        db.add(RoomEquipment(room_id=room.id, equipment_id=board.id, quantity=1))

    for room in rooms[4:6]:  # Labs get lab equipment
        db.add(RoomEquipment(room_id=room.id, equipment_id=lab_eq.id, quantity=10))

    for room in rooms[6:8]:  # Computer labs
        db.add(RoomEquipment(room_id=room.id, equipment_id=comp.id, quantity=30))

    db.commit()
    print(f"✅ {len(rooms)} ta xona yaratildi")
    return rooms


def seed_subjects():
    print("📚 Fanlar yaratilmoqda...")
    subjects = [
        Subject(name="Matematika", code="MATH101", subject_type=SubjectType.lecture, weekly_hours=4),
        Subject(name="Fizika", code="PHYS101", subject_type=SubjectType.lecture, weekly_hours=4),
        Subject(name="Kimyo laboratoriyasi", code="CHEM101", subject_type=SubjectType.lab, weekly_hours=2),
        Subject(name="Dasturlash asoslari", code="CS101", subject_type=SubjectType.computer_lab, weekly_hours=4),
        Subject(name="Ingliz tili", code="ENG101", subject_type=SubjectType.seminar, weekly_hours=4),
        Subject(name="Tarix", code="HIST101", subject_type=SubjectType.lecture, weekly_hours=2),
        Subject(name="Iqtisodiyot", code="ECON101", subject_type=SubjectType.lecture, weekly_hours=2),
        Subject(name="Biologiya", code="BIO101", subject_type=SubjectType.lab, weekly_hours=2),
        Subject(name="Ma'lumotlar bazasi", code="DB201", subject_type=SubjectType.computer_lab, weekly_hours=4),
        Subject(name="Falsafa", code="PHIL101", subject_type=SubjectType.seminar, weekly_hours=2),
        Subject(name="Statistika", code="STAT101", subject_type=SubjectType.lecture, weekly_hours=2),
        Subject(name="Algoritmlar", code="ALG201", subject_type=SubjectType.computer_lab, weekly_hours=4),
        Subject(name="Fizika laboratoriyasi", code="PHYS-LAB", subject_type=SubjectType.lab, weekly_hours=2),
        Subject(name="O'zbek tili", code="UZB101", subject_type=SubjectType.seminar, weekly_hours=2),
        Subject(name="Raqamli texnologiyalar", code="DT101", subject_type=SubjectType.computer_lab, weekly_hours=2),
    ]
    db.add_all(subjects)
    db.commit()
    print(f"✅ {len(subjects)} ta fan yaratildi")
    return subjects


def seed_teachers():
    print("👨‍🏫 O'qituvchilar yaratilmoqda...")
    teachers_data = [
        ("Akbar", "Toshmatov", "a.toshmatov@univ.uz", "+998901234561", "Matematika"),
        ("Zulfiya", "Rahimova", "z.rahimova@univ.uz", "+998901234562", "Fizika"),
        ("Bobur", "Yusupov", "b.yusupov@univ.uz", "+998901234563", "Kimyo"),
        ("Malika", "Saidova", "m.saidova@univ.uz", "+998901234564", "Informatika"),
        ("Jasur", "Nazarov", "j.nazarov@univ.uz", "+998901234565", "Ingliz tili"),
        ("Nilufar", "Karimova", "n.karimova@univ.uz", "+998901234566", "Tarix"),
        ("Sarvar", "Xolmatov", "s.xolmatov@univ.uz", "+998901234567", "Iqtisodiyot"),
        ("Feruza", "Alieva", "f.alieva@univ.uz", "+998901234568", "Biologiya"),
        ("Ulugbek", "Ergashev", "u.ergashev@univ.uz", "+998901234569", "Informatika"),
        ("Dilnoza", "Mirzaeva", "d.mirzaeva@univ.uz", "+998901234570", "Matematika"),
    ]
    teachers = []
    for fn, ln, email, phone, dept in teachers_data:
        t = Teacher(first_name=fn, last_name=ln, email=email, phone=phone, department=dept)
        db.add(t)
        teachers.append(t)
    db.flush()

    # Add availability Mon-Fri 08:00–18:00 for all teachers
    for teacher in teachers:
        for day in range(5):  # 0=Mon..4=Fri
            avail = TeacherAvailability(
                teacher_id=teacher.id,
                day_of_week=day,
                start_time=time(8, 0),
                end_time=time(18, 30),
            )
            db.add(avail)

    db.commit()
    print(f"✅ {len(teachers)} ta o'qituvchi yaratildi (availability: Mon-Fri 08:00-18:30)")
    return teachers


def seed_groups():
    print("👥 Guruhlar yaratilmoqda...")
    groups = [
        StudentGroup(name="CS-101", faculty="Informatika", semester=1, student_count=28, academic_year="2024-2025"),
        StudentGroup(name="CS-102", faculty="Informatika", semester=1, student_count=25, academic_year="2024-2025"),
        StudentGroup(name="CS-201", faculty="Informatika", semester=3, student_count=24, academic_year="2024-2025"),
        StudentGroup(name="CS-202", faculty="Informatika", semester=3, student_count=22, academic_year="2024-2025"),
        StudentGroup(name="ENG-101", faculty="Muhandislik", semester=1, student_count=30, academic_year="2024-2025"),
        StudentGroup(name="ENG-201", faculty="Muhandislik", semester=3, student_count=27, academic_year="2024-2025"),
        StudentGroup(name="ECO-101", faculty="Iqtisodiyot", semester=1, student_count=35, academic_year="2024-2025"),
        StudentGroup(name="ECO-201", faculty="Iqtisodiyot", semester=3, student_count=32, academic_year="2024-2025"),
    ]
    db.add_all(groups)
    db.commit()
    print(f"✅ {len(groups)} ta guruh yaratildi")
    return groups


def seed_slots(subjects, teachers, groups, rooms):
    print("🗓  Demo dars jadvali yaratilmoqda...")

    # Map room types for easy lookup
    lecture_rooms = [r for r in rooms if r.room_type == RoomType.lecture]
    seminar_rooms = [r for r in rooms if r.room_type == RoomType.seminar]
    lab_rooms     = [r for r in rooms if r.room_type == RoomType.lab]
    comp_rooms    = [r for r in rooms if r.room_type == RoomType.computer_lab]

    room_map = {
        SubjectType.lecture:      lecture_rooms,
        SubjectType.seminar:      seminar_rooms,
        SubjectType.lab:          lab_rooms,
        SubjectType.computer_lab: comp_rooms,
    }

    # Subject -> teacher rough mapping
    subj_teacher = {
        "MATH101": teachers[0], "STAT101": teachers[9],
        "PHYS101": teachers[1], "PHYS-LAB": teachers[1],
        "CHEM101": teachers[2],
        "CS101":   teachers[3], "DB201": teachers[8], "ALG201": teachers[8], "DT101": teachers[3],
        "ENG101":  teachers[4],
        "HIST101": teachers[5],
        "ECON101": teachers[6],
        "BIO101":  teachers[7],
        "PHIL101": teachers[5],
        "UZB101":  teachers[4],
    }

    time_slots = [
        (time(8, 0),  time(9, 30)),
        (time(9, 45), time(11, 15)),
        (time(11, 30), time(13, 0)),
        (time(13, 30), time(15, 0)),
        (time(15, 15), time(16, 45)),
    ]

    # Track used: (teacher_id, day, start), (group_id, day, start), (room_id, day, start)
    used_teacher = set()
    used_group   = set()
    used_room    = set()

    slots = []
    day_cycle = [0, 1, 2, 3, 4]

    for group in groups:
        slot_idx = 0
        for subj in subjects[:10]:  # first 10 subjects per group
            teacher = subj_teacher.get(subj.code, teachers[0])
            possible_rooms = room_map.get(subj.subject_type, lecture_rooms)

            placed = False
            for day in day_cycle:
                if placed:
                    break
                for ts_start, ts_end in time_slots:
                    tk = (teacher.id, day, ts_start)
                    gk = (group.id, day, ts_start)
                    if tk in used_teacher or gk in used_group:
                        continue
                    for room in possible_rooms:
                        if room.capacity < group.student_count:
                            continue
                        rk = (room.id, day, ts_start)
                        if rk in used_room:
                            continue
                        slot = Slot(
                            subject_id=subj.id,
                            teacher_id=teacher.id,
                            group_id=group.id,
                            room_id=room.id,
                            day_of_week=day,
                            start_time=ts_start,
                            end_time=ts_end,
                            week_type=WeekType.all,
                            status=SlotStatus.active,
                        )
                        db.add(slot)
                        used_teacher.add(tk)
                        used_group.add(gk)
                        used_room.add(rk)
                        slots.append(slot)
                        placed = True
                        break
                    if placed:
                        break

            day_cycle = day_cycle[1:] + [day_cycle[0]]  # rotate days

    db.commit()
    print(f"✅ {len(slots)} ta demo slot yaratildi")
    return slots


def main():
    print("\n" + "="*50)
    print("  DARS JADVALI TIZIMI — SEED SCRIPT")
    print("="*50 + "\n")

    clear_data()
    users    = seed_users()
    equip    = seed_equipment()
    rooms    = seed_rooms(equip)
    subjects = seed_subjects()
    teachers = seed_teachers()
    groups   = seed_groups()
    slots    = seed_slots(subjects, teachers, groups, rooms)

    print("\n" + "="*50)
    print("  SEED MUVAFFAQIYATLI YAKUNLANDI!")
    print("="*50)
    print("\n🔑 Login ma'lumotlari:")
    print("  admin      / admin123  (Admin)")
    print("  dispatcher / disp123   (Dispatcher)")
    print("  teacher1   / teach123  (Teacher)")
    print("  student1   / stud123   (Student)")
    print("\n📊 Yaratilgan ma'lumotlar:")
    print(f"  Foydalanuvchilar : {len(users)}")
    print(f"  O'qituvchilar    : {len(teachers)}")
    print(f"  Fanlar           : {len(subjects)}")
    print(f"  Guruhlar         : {len(groups)}")
    print(f"  Xonalar          : {len(rooms)}")
    print(f"  Slotlar          : {len(slots)}")
    print()


if __name__ == "__main__":
    main()
    db.close()
