from __future__ import annotations

import os
from typing import Any

from fastapi import HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

ALGORITHM = "HS256"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")


def verify_token(token: str) -> dict[str, Any] | None:
	"""Verifica el token JWT y retorna el payload si es valido."""
	if not token or not JWT_SECRET_KEY:
		return None
	try:
		payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
		return payload
	except JWTError:
		return None


def get_current_user(token: str, db: AsyncSession | None = None) -> dict[str, Any]:
	"""Obtiene el usuario actual a partir del token JWT."""
	payload = verify_token(token)
	if not payload:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Token invalido o expirado",
		)

	user_id = payload.get("sub") or payload.get("user_id")
	if not user_id:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Token invalido o sin identificador",
		)

	return payload
