from __future__ import annotations

import os

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


# Configuracion CORS para desarrollo.
app.add_middleware(
	CORSMiddleware,
	allow_origins=[*default_origins, *extra_origins],
	allow_origin_regex=r"https://.*\.onrender\.com",
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
