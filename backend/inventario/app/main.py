from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.ingredientes import router as ingredientes_router
from app.routers.inventario import router as inventario_router

ORIGINS = [
    "https://johns-papas-orders-service.onrender.com",
    "http://localhost:5173",  # Vite
    "http://localhost:3000",  # React
    "http://localhost:8000",  # Desarrollo local
]

app = FastAPI(
	title="Inventario Service",
	description="Microservicio de gestión de inventario e ingredientes",
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

app.include_router(ingredientes_router)
app.include_router(inventario_router)


@app.get("/")
async def root() -> dict[str, str]:
	"""Retorna informacion basica del servicio."""
	return {
		"service": "inventario",
		"message": "Microservicio de gestion de inventario e ingredientes",
		"version": "1.0.0",
	}


@app.get("/health")
async def health_check() -> dict[str, str]:
	"""Health check del servicio."""
	return {"status": "ok", "service": "inventario"}
