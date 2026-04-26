from __future__ import annotations

import os
import re

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.routers.estados import router as estados_router
from app.routers.pedidos import router as pedidos_router

app = FastAPI(
	title="Pedidos Service",
	description="Microservicio de gestion de pedidos",
	version="1.0.0",
)

default_origins = [
	"http://localhost",
	"http://localhost:3000",
	"http://localhost:5173",
	"http://127.0.0.1",
	"http://127.0.0.1:3000",
	"http://127.0.0.1:5173",
	"https://johns-papas-orders-service.onrender.com",
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
