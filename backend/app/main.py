from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import applications, auth, cvs, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CV Ledger API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.allowed_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cvs.router)
app.include_router(applications.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
