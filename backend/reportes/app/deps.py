from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from app.auth import get_current_user
from app.database import get_db


# OAuth2 para Swagger UI (el login real vive en usuario service).
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


# Dependencia que obtiene el user_id desde el token JWT.
async def get_current_user_id(
	token: Annotated[str, Depends(oauth2_scheme)],
) -> str:
	payload = get_current_user(token)
	user_id = payload.get("sub") or payload.get("user_id")
	return str(user_id)


# Dependencia opcional que retorna None si no hay token.
async def get_current_user_optional(
	token: Annotated[str | None, Depends(oauth2_scheme_optional)],
) -> str | None:
	if not token:
		return None
	try:
		payload = get_current_user(token)
		user_id = payload.get("sub") or payload.get("user_id")
		return str(user_id)
	except Exception:
		return None


__all__ = ["get_current_user_id", "get_current_user_optional", "get_db"]
