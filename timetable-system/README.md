# 🎓 Dars Jadvali Tizimi (Timetable Management System)

Universitet uchun to'liq ishlaydigan dars jadvali boshqaruv tizimi.
FastAPI (backend) + React/TypeScript (frontend) + PostgreSQL.

---

## 🛠 Tech Stack

| Layer     | Texnologiyalar                                    |
|-----------|---------------------------------------------------|
| Backend   | FastAPI, SQLAlchemy, Alembic, Pydantic, JWT, psycopg2 |
| Frontend  | React 18, Vite, TypeScript, TailwindCSS, @dnd-kit  |
| Database  | PostgreSQL 14+                                    |
| Auth      | JWT Bearer Token                                  |

---

## 📁 Project Structure

```
timetable-system/
├── backend/
│   ├── app/
│   │   ├── core/          # config, security, dependencies
│   │   ├── db/            # base, session, all_models
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── crud/          # database operations
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # business logic
│   │   └── main.py        # FastAPI app entry point
│   ├── alembic/           # migrations
│   ├── alembic.ini
│   ├── seed.py            # demo data
│   ├── .env
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/           # axios client + services
    │   ├── components/    # layout, ui components
    │   ├── pages/         # all pages
    │   ├── store/         # auth context
    │   ├── types/         # TypeScript types
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

---

## ⚙️ 1. PostgreSQL Database Yaratish

```sql
-- psql orqali yoki pgAdmin da:
CREATE DATABASE darsjadvali_db;
```

---

## ⚙️ 2. Backend .env Sozlash

`backend/.env` fayli allaqachon yaratilgan:

```env
DATABASE_URL=postgresql+psycopg2://postgres:12345@localhost:5432/darsjadvali_db
SECRET_KEY=supersecretkey-change-in-production-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

PostgreSQL parolini o'zingiznikiga o'zgartiring.

---

## 🚀 3. Backend Ishga Tushirish (Git Bash)

```bash
cd timetable-system/backend

# Virtual environment yaratish
python -m venv venv

# Aktivlashtirish
source venv/Scripts/activate      # Windows Git Bash
# yoki:
source venv/bin/activate           # Linux/Mac

# Kutubxonalarni o'rnatish
pip install -r requirements.txt

# Database migratsiyasini yaratish va qo'llash
alembic revision --autogenerate -m "initial"
alembic upgrade head

# Demo ma'lumotlarni yuklash
python seed.py

# Serverni ishga tushirish
uvicorn app.main:app --reload
```

Backend: **http://localhost:8000**
Swagger UI: **http://localhost:8000/api/docs**

---

## 🌐 4. Frontend Ishga Tushirish

```bash
# Yangi terminal oching
cd timetable-system/frontend

npm install
npm run dev
```

Frontend: **http://localhost:5173**

---

## 🔑 Login Ma'lumotlari

| Username     | Parol      | Rol         |
|-------------|------------|-------------|
| `admin`     | `admin123` | Admin       |
| `dispatcher`| `disp123`  | Dispatcher  |
| `teacher1`  | `teach123` | Teacher     |
| `student1`  | `stud123`  | Student     |

---

## 📊 Seed Data Tarkibi

Seed script quyidagilarni yaratadi:

- **4** foydalanuvchi (admin, dispatcher, teacher, student)
- **10** o'qituvchi (Mon-Fri 08:00-18:30 availability bilan)
- **15** fan (lecture, lab, seminar, computer_lab turlarida)
- **8** guruh (turli fakultetlar)
- **12** xona (lecture, seminar, lab, computer_lab turlarida)
- **5** jihoz turi
- **~80** demo slot

---

## 🧪 Test Qilish

### Auto Generate Timetable

1. Frontend → "Dars Jadvali" sahifasiga o'ting
2. "Auto Jadval" tugmasini bosing
3. Backend barcha constraint lar asosida slotlar yaratadi

### Drag & Drop Test

1. "Dars Jadvali" sahifasiga o'ting
2. Guruh/O'qituvchi/Xona tanlang
3. Istalgan slotni ushlab boshqa vaqtga sudrang
4. Konflikt bo'lsa harakatga ruxsat berilmaydi (toast error)
5. Muvaffaqiyatli bo'lsa jadval yangilanadi

### Conflict Test (Slots sahifasida)

```
1. Slots → "Qo'shish" tugmasi
2. Bir xil vaqtda bir xil xona/teacher/group tanlang
3. "Tekshir va Saqlash" bosing
4. Conflict xabarlari ko'rsatiladi
```

### Room Critical Status Test

```
1. Rooms sahifasiga o'ting
2. Istalgan xonaning "Faol" badge ini bosing
3. Status → "Kritik" ga o'zgartiring
4. Backend avtomatik ravishda:
   - Shu xonadagi slotlarni topadi
   - Boshqa mos xona qidiradi
   - Topilsa ko'chiradi + notification yozadi
   - Topilmasa slot status = requires_action
```

---

## 🌍 API Endpoints

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/teachers            GET /api/teachers/{id}
POST   /api/teachers            PUT /api/teachers/{id}
DELETE /api/teachers/{id}
GET    /api/teachers/{id}/availability
PUT    /api/teachers/{id}/availability

GET    /api/subjects            POST /api/subjects
PUT    /api/subjects/{id}       DELETE /api/subjects/{id}

GET    /api/groups              POST /api/groups
PUT    /api/groups/{id}         DELETE /api/groups/{id}

GET    /api/rooms               POST /api/rooms
PUT    /api/rooms/{id}          DELETE /api/rooms/{id}
PATCH  /api/rooms/{id}/status
POST   /api/rooms/{id}/equipment
DELETE /api/rooms/{id}/equipment/{eq_id}

GET    /api/equipment           POST /api/equipment
PUT    /api/equipment/{id}      DELETE /api/equipment/{id}

GET    /api/slots               POST /api/slots
PUT    /api/slots/{id}          DELETE /api/slots/{id}
PATCH  /api/slots/{id}/drag-drop

GET    /api/timetable/group/{id}
GET    /api/timetable/teacher/{id}
GET    /api/timetable/room/{id}
POST   /api/timetable/generate

GET    /api/notifications
PATCH  /api/notifications/mark-read

GET    /api/audit-logs
GET    /api/dashboard/stats
```

---

## 🔐 Rollar va Ruxsatlar

| Amal                        | Admin | Dispatcher | Teacher | Student |
|-----------------------------|-------|------------|---------|---------|
| Ma'lumot ko'rish            | ✅    | ✅         | ✅      | ✅      |
| CRUD (entities)             | ✅    | ✅         | ❌      | ❌      |
| Slot boshqarish             | ✅    | ✅         | ❌      | ❌      |
| Room status o'zgartirish    | ✅    | ✅         | ❌      | ❌      |
| Jadval generatsiya          | ✅    | ✅         | ❌      | ❌      |

---

## 🗃 Database Schema

```
users ─────────── teachers ─── teacher_availabilities
                      │
subjects ─────────── slots ─── student_groups
                      │
rooms ─────────── room_equipment ─── equipment

notifications (linked to slots)
audit_logs (linked to users)
```

---

## 📦 Zip Qilish Kerak Bo'lgan Fayllar

```bash
# Barcha fayllar (node_modules va venv dan tashqari):
zip -r timetable-system.zip timetable-system/ \
  --exclude "*/node_modules/*" \
  --exclude "*/__pycache__/*" \
  --exclude "*/venv/*" \
  --exclude "*/.env"
```

---

## 💡 Muhim Eslatmalar

- Python 3.10+ tavsiya qilinadi
- Node.js 18+ kerak
- PostgreSQL 14+ tavsiya qilinadi
- `.env` faylidagi `SECRET_KEY` ni production da albatta o'zgartiring
