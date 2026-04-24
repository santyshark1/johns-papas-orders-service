from __future__ import annotations

import os

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from .models import Base


def _normalize_database_url(database_url: str) -> str:
	"""Normaliza la URL de PostgreSQL para usar asyncpg."""
	if database_url.startswith("postgresql+asyncpg://"):
		return database_url
	if database_url.startswith("postgresql://"):
		return database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
	return database_url


# URL de conexion a la base de datos desde variables de entorno.
DATABASE_URL = _normalize_database_url(os.getenv("DATABASE_URL", ""))

# Motor asincrono para PostgreSQL usando asyncpg.
engine = create_async_engine(
	DATABASE_URL,
	pool_size=5,
	max_overflow=10,
)

# Fabrica de sesiones asincronas para dependencias de FastAPI.
AsyncSessionLocal = sessionmaker(
	bind=engine,
	class_=AsyncSession,
	expire_on_commit=False,
)


# Dependencia que entrega una sesion asincrona y la cierra al terminar.
async def get_db() -> AsyncSession:
	async with AsyncSessionLocal() as session:
		yield session