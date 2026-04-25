from __future__ import annotations

import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from .models import Base


def _normalize_database_url(database_url: str) -> str:
	"""Normaliza la URL de PostgreSQL para usar asyncpg."""
	if database_url.startswith("postgresql+asyncpg://"):
		normalized = database_url
	elif database_url.startswith("postgresql://"):
		normalized = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
	else:
		return database_url

	if "supabase.co" in normalized and "ssl=" not in normalized and "sslmode=" not in normalized:
		separator = "&" if "?" in normalized else "?"
		normalized = f"{normalized}{separator}ssl=require"

	return normalized


# URL de conexion a la base de datos desde variables de entorno.
DATABASE_URL = _normalize_database_url(
    os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./usuario.db")
)

engine_kwargs = {}
if DATABASE_URL.startswith("sqlite+"):
    engine_kwargs["echo"] = False
else:
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10

# Motor asincrono para PostgreSQL usando asyncpg.
engine = create_async_engine(
	DATABASE_URL,
	**engine_kwargs,
)

# Fabrica de sesiones asincronas para dependencias de FastAPI.
AsyncSessionLocal = sessionmaker(
	bind=engine,
	class_=AsyncSession,
	expire_on_commit=False,
)


# Dependencia que entrega una sesion asincrona y la cierra al terminar.
async def get_db() -> AsyncGenerator[AsyncSession, None]:
	async with AsyncSessionLocal() as session:
		yield session