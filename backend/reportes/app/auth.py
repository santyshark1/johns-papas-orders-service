from __future__ import annotations

import os
from typing import Any

from fastapi import HTTPException, status
from jose import JWTError, jwt


ALGORITHM = "HS256"

 
def _get_jwt_secret_key() -> str:
	# Obtiene la clave secreta para verificar tokens.
	secret = os.getenv("JWT_SECRET_KEY", "").strip()
	if not secret:
		raise RuntimeError("JWT_SECRET_KEY no esta configurada")
	return secret


# Verifica un token y retorna su payload si es valido.
def verify_token(token: str) -> dict[str, Any] | None:
	try:
		return jwt.decode(token, _get_jwt_secret_key(), algorithms=[ALGORITHM])
	except JWTError:
		return None


# Obtiene el payload del usuario actual a partir del token.
def get_current_user(token: str) -> dict[str, Any]:
	payload = verify_token(token)
	if not payload:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")

	user_id = payload.get("sub") or payload.get("user_id")
	if not user_id:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token sin sujeto")

	return payload
