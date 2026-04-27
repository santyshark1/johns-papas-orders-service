from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auditoria import router as auditoria_router
from app.routers.inventario import router as inventario_router
from app.routers.ventas import router as ventas_router

ORIGINS = [
    "https://johns-papas-orders-service.onrender.com",
    "http://localhost:5173",  # Vite
    "http://localhost:3000",  # React
    "http://localhost:8000",  # Desarrollo local
]

app = FastAPI(
	title="Reportes Service",
	description="Microservicio de reportes y auditoria",
	version="1.0.0",
)


# Configuracion CORS para desarrollo.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
	max_age=600,
)


app.include_router(ventas_router)
app.include_router(inventario_router)
app.include_router(auditoria_router)


@app.get("/")
async def root() -> dict[str, str]:
	"""Informacion basica del servicio."""
	return {
		"service": "reportes",
		"description": "Microservicio de reportes y auditoria",
		"version": "1.0.0",
	}


@app.get("/health")
async def health_check() -> dict[str, str]:
	"""Health check del servicio de reportes."""
	return {"status": "ok", "service": "reportes"}
