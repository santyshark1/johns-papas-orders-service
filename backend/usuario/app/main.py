from __future__ import annotations

import os
import re

from fastapi import FastAPI, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware

from app.database import DATABASE_URL, engine
from app.models import Base
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

_cors_origin_pattern = re.compile(
    r"^(https://.*\.onrender\.com|http://localhost(?::\d+)?|http://127\.0\.0\.1(?::\d+)?)$"
)


@app.middleware("http")
async def ensure_cors_headers(request: Request, call_next):
    origin = request.headers.get("origin")

    if request.method == "OPTIONS":
        response = Response(status_code=200)
    else:
        response = await call_next(request)

    if origin and _cors_origin_pattern.match(origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Vary"] = "Origin"

    return response


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


@app.on_event("startup")
async def startup() -> None:
    auto_create_tables = os.getenv("AUTO_CREATE_TABLES", "false").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }

    if DATABASE_URL.startswith("sqlite+") or auto_create_tables:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)