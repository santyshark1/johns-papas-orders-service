from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auditoria import router as auditoria_router
from app.routers.inventario import router as inventario_router
from app.routers.ventas import router as ventas_router


app = FastAPI(
	title="Reportes Service",
	description="Microservicio de reportes y auditoria",
	version="1.0.0",
)


# Configuracion CORS para desarrollo.
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
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
