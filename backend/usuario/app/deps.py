from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import Usuario


# Esquema OAuth2 para Swagger UI (muestra el boton Authorize).
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login/swagger")

# Variante opcional para endpoints publicos.
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


# Dependencia para obtener el usuario autenticado desde el token.
async def get_current_user_dep(
	token: Annotated[str, Depends(oauth2_scheme)],
	db: Annotated[AsyncSession, Depends(get_db)],
) -> Usuario:
	return await get_current_user(token, db)


# Dependencia opcional: retorna None si no hay token.
async def get_current_user_optional(
	token: Annotated[str | None, Depends(oauth2_scheme_optional)],
	db: Annotated[AsyncSession, Depends(get_db)],
) -> Usuario | None:
	if not token:
		return None
	return await get_current_user(token, db)


# Re-export de get_db para mantener dependencias en un solo lugar.
__all__ = ["get_db", "get_current_user_dep", "get_current_user_optional", "oauth2_scheme"]