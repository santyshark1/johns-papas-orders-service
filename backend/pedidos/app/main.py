from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.estados import router as estados_router
from app.routers.pedidos import router as pedidos_router

app = FastAPI(
	title="Pedidos Service",
	description="Microservicio de gestion de pedidos",
	version="1.0.0",
)

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(pedidos_router)
app.include_router(estados_router)


@app.get("/")
async def root() -> dict[str, str]:
	"""Retorna informacion basica del servicio."""
	return {
		"service": "pedidos",
		"version": "1.0.0",
		"status": "running",
	}


@app.get("/health")
async def health() -> dict[str, str]:
	"""Health check del servicio."""
	return {"status": "ok", "service": "pedidos"}
