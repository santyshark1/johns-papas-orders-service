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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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