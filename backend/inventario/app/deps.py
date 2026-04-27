from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from .auth import get_current_user
from .database import get_db
 

# OAuth2 para Swagger UI (el login real vive en usuario service).
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login/swagger")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


# Obtiene el user_id del token actual.
async def get_current_user_id(
	token: Annotated[str, Depends(oauth2_scheme)],
) -> str:
	payload = get_current_user(token)
	user_id = payload.get("sub") or payload.get("user_id")
	return str(user_id)


# Obtiene el user_id si hay token; retorna None si falta.
async def get_current_user_optional(
	token: Annotated[str | None, Depends(oauth2_scheme_optional)],
) -> str | None:
	if not token:
		return None
	payload = get_current_user(token)
	user_id = payload.get("sub") or payload.get("user_id")
	return str(user_id)
