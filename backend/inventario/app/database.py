from __future__ import annotations

import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from .models import Base


def _normalize_database_url(database_url: str) -> str:
	"""Normaliza la URL para usar el driver asyncpg."""
	if database_url.startswith("postgresql+asyncpg://"):
		return database_url
	if database_url.startswith("postgresql://"):
		return database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
	return database_url


DATABASE_URL = _normalize_database_url(os.getenv("DATABASE_URL", ""))

engine = create_async_engine(
	DATABASE_URL,
	pool_size=5,
	max_overflow=10,
)

AsyncSessionLocal = sessionmaker(
	bind=engine,
	class_=AsyncSession,
	expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
	"""Entrega una sesion asinc para operaciones con la BD."""
	async with AsyncSessionLocal() as session:
		yield session
