from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.teachers import router as teachers_router
from app.routers.subjects import router as subjects_router
from app.routers.groups import router as groups_router
from app.routers.rooms import router as rooms_router, equip_router
from app.routers.slots import router as slots_router
from app.routers.timetable import router as timetable_router
from app.routers.notifications import notif_router, audit_router
from app.routers.dashboard import router as dashboard_router

app = FastAPI(
    title="Dars Jadvali Tizimi API",
    description="Universitet dars jadvali boshqaruv tizimi",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api"

app.include_router(auth_router, prefix=PREFIX)
app.include_router(teachers_router, prefix=PREFIX)
app.include_router(subjects_router, prefix=PREFIX)
app.include_router(groups_router, prefix=PREFIX)
app.include_router(rooms_router, prefix=PREFIX)
app.include_router(equip_router, prefix=PREFIX)
app.include_router(slots_router, prefix=PREFIX)
app.include_router(timetable_router, prefix=PREFIX)
app.include_router(notif_router, prefix=PREFIX)
app.include_router(audit_router, prefix=PREFIX)
app.include_router(dashboard_router, prefix=PREFIX)


@app.get("/")
def root():
    return {"message": "Dars Jadvali Tizimi API ishlayapti", "docs": "/api/docs"}
