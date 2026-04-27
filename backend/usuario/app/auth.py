from __future__ import annotations

import os
import uuid
from datetime import datetime, timedelta
from typing import Any

import bcrypt
from fastapi import HTTPException, status
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import Rol, Usuario, UsuarioRol
from .schemas import UsuarioRegister


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


def _get_jwt_secret_key() -> str:
    secret = os.getenv("JWT_SECRET_KEY", "").strip()
    if not secret:
        raise RuntimeError("JWT_SECRET_KEY no esta configurada")
    return secret


def hash_password(password: str) -> str:
    """Genera hash bcrypt de una contraseña."""
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    """Verifica contraseña contra su hash bcrypt."""
    try:
        plain_bytes = plain.encode('utf-8')[:72]
        hashed_bytes = hashed.encode('utf-8')
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except ValueError:
        # Si el hash no es válido para bcrypt (ej: hash antiguo de passlib)
        return False


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, _get_jwt_secret_key(), algorithm=ALGORITHM)


def create_refresh_token(data: dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, _get_jwt_secret_key(), algorithm=ALGORITHM)


def verify_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, _get_jwt_secret_key(), algorithms=[ALGORITHM])
    except JWTError:
        return None


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


async def get_user_by_email(db: AsyncSession, email: str) -> Usuario | None:
    stmt = select(Usuario).where(Usuario.email == email.lower()).options(selectinload(Usuario.roles))
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Usuario | None:
    stmt = select(Usuario).where(Usuario.id == user_id).options(selectinload(Usuario.roles))
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


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
    await db.commit()
    await db.refresh(usuario)

    # Asignar rol por defecto (opcional)
    default_tienda_id = os.getenv("DEFAULT_TIENDA_ID", "").strip()
    if default_tienda_id:
        role_stmt = select(Rol).where(Rol.nombre == "usuario")
        role_result = await db.execute(role_stmt)
        default_role = role_result.scalar_one_or_none()
        if default_role:
            try:
                db.add(UsuarioRol(
                    usuario_id=usuario.id,
                    rol_id=default_role.id,
                    tienda_id=uuid.UUID(default_tienda_id),
                ))
                await db.commit()
            except ValueError:
                pass

    # Recargar con roles para la respuesta
    usuario = await get_user_by_id(db, usuario.id)
    return usuario


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Usuario | None:
    usuario = await get_user_by_email(db, email)
    if not usuario or not usuario.password_hash:
        return None
    if not verify_password(password, usuario.password_hash):
        return None
    return usuario


def create_user_tokens(usuario: Usuario) -> dict[str, str]:
    payload = {"sub": str(usuario.id)}
    return {
        "access_token": create_access_token(payload),
        "refresh_token": create_refresh_token(payload),
    }