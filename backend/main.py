import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pedidos.app.routers.pedidos import router as pedidos_router
from usuario.app.routers.auth import router as auth_router

app = FastAPI()

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

app.include_router(auth_router, prefix="/api")
app.include_router(pedidos_router, prefix="/api")