import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.roles import router as roles_router
from app.routers.usuarios import router as usuarios_router


app = FastAPI(
    title="Usuario Service",
    description="Microservicio de gestion de usuarios, autenticacion y roles",
    version="1.0.0",
)

default_origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

extra_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOW_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[*default_origins, *extra_origins],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "usuario",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": "usuario"}


# Los routers ya incluyen su prefix internamente.
app.include_router(auth_router)
app.include_router(usuarios_router)
app.include_router(roles_router)