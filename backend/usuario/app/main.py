from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.roles import router as roles_router
from app.routers.usuarios import router as usuarios_router

ORIGINS = [
    "https://johns-papas-orders-service.onrender.com",
    "http://localhost:5173",  # Vite
    "http://localhost:3000",  # React
    "http://localhost:8000",  # Desarrollo local
]

app = FastAPI(
    title="Usuario Service",
    description="Microservicio de gestion de usuarios, autenticacion y roles",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
	max_age=600,
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