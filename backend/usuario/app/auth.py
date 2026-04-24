from __future__ import annotations

import os
import uuid
from datetime import datetime, timedelta
from typing import Any

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import Permiso, Rol, Usuario, UsuarioRol
from .schemas import UsuarioRegister


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def _get_jwt_secret_key() -> str:
	# Obtiene la clave secreta para firmar tokens.
	secret = os.getenv("JWT_SECRET_KEY", "").strip()
	if not secret:
		raise RuntimeError("JWT_SECRET_KEY no esta configurada")
	return secret


# Genera hash seguro para contrasenas.
def hash_password(password: str) -> str:
	return _pwd_context.hash(password)


# Verifica contrasena en texto plano contra su hash.
def verify_password(plain: str, hashed: str) -> bool:
	return _pwd_context.verify(plain, hashed)


# Crea un access token con expiracion configurable.
def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
	to_encode = data.copy()
	expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
	to_encode.update({"exp": expire})
	return jwt.encode(to_encode, _get_jwt_secret_key(), algorithm=ALGORITHM)


# Crea un refresh token con expiracion de 7 dias.
def create_refresh_token(data: dict[str, Any]) -> str:
	to_encode = data.copy()
	expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
	to_encode.update({"exp": expire})
	return jwt.encode(to_encode, _get_jwt_secret_key(), algorithm=ALGORITHM)


# Verifica un token y retorna su payload si es valido.
def verify_token(token: str) -> dict[str, Any] | None:
	try:
		return jwt.decode(token, _get_jwt_secret_key(), algorithms=[ALGORITHM])
	except JWTError:
		return None


# Obtiene un usuario a partir del token actual.
async def get_current_user(token: str, db: AsyncSession) -> Usuario:
	payload = verify_token(token)
	if not payload:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")

	user_id = payload.get("sub") or payload.get("user_id")
	if not user_id:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token sin sujeto")

	try:
		user_uuid = uuid.UUID(str(user_id))
	except ValueError as exc:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido") from exc

	usuario = await get_user_by_id(db, user_uuid)
	if not usuario:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
	return usuario


# Registra un usuario nuevo y asigna el rol por defecto si existe.
async def register_user(db: AsyncSession, user_data: UsuarioRegister) -> Usuario:
    existing_user = await get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email ya registrado")

    usuario = Usuario(
        nombre=user_data.nombre,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
    )
    db.add(usuario)
    await db.flush()
    await db.refresh(usuario)

    # Asigna el rol "usuario" si existe y se cuenta con tienda_id por defecto.
    role_stmt = select(Rol).where(Rol.nombre == "usuario")
    role_result = await db.execute(role_stmt)
    default_role = role_result.scalar_one_or_none()
    default_tienda_id = os.getenv("DEFAULT_TIENDA_ID", "").strip()
    if default_role and default_tienda_id:
        try:
            db.add(
                UsuarioRol(
                    usuario_id=usuario.id,
                    rol_id=default_role.id,
                    tienda_id=uuid.UUID(default_tienda_id),
                )
            )
        except ValueError:
            pass

    await db.commit()
    await db.refresh(usuario)
    return usuario


# Autentica un usuario con email y contrasena.
async def authenticate_user(db: AsyncSession, email: str, password: str) -> Usuario | None:
	usuario = await get_user_by_email(db, email)
	if not usuario or not usuario.password_hash:
		return None
	if not verify_password(password, usuario.password_hash):
		return None
	return usuario


# Crea tokens para un usuario autenticado.
def create_user_tokens(usuario: Usuario) -> dict[str, str]:
	payload = {"sub": str(usuario.id)}
	return {
		"access_token": create_access_token(payload),
		"refresh_token": create_refresh_token(payload),
	}


# Busca usuario por email.
async def get_user_by_email(db: AsyncSession, email: str) -> Usuario | None:
	stmt = select(Usuario).where(Usuario.email == email.lower()).options(selectinload(Usuario.roles))
	result = await db.execute(stmt)
	return result.scalar_one_or_none()


# Busca usuario por id.
async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Usuario | None:
	stmt = select(Usuario).where(Usuario.id == user_id).options(selectinload(Usuario.roles))
	result = await db.execute(stmt)
	return result.scalar_one_or_none()
