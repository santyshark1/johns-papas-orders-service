from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
	authenticate_user,
	create_user_tokens,
	get_user_by_id,
	register_user,
	verify_token,
)
from app.database import get_db
from app.schemas import (
	RefreshTokenRequest,
	TokenResponse,
	UsuarioLogin,
	UsuarioRegister,
	UsuarioResponse,
)


router = APIRouter(prefix="/auth", tags=["autenticacion"])


def _build_usuario_response(usuario) -> UsuarioResponse:
	# Construye la respuesta segura del usuario (sin password).
	roles = [rol.nombre for rol in (usuario.roles or []) if rol and rol.nombre]
	return UsuarioResponse(
		id=usuario.id,
		nombre=usuario.nombre,
		email=usuario.email,
		roles=roles,
	)


@router.post("/register", response_model=UsuarioResponse)
async def register(
	data: UsuarioRegister,
	db: AsyncSession = Depends(get_db),
) -> UsuarioResponse:
	# Registra un nuevo usuario en el sistema.
	usuario = await register_user(db, data)
	return _build_usuario_response(usuario)


@router.post("/login", response_model=TokenResponse)
async def login(
	data: UsuarioLogin,
	db: AsyncSession = Depends(get_db),
) -> TokenResponse:
	# Autentica al usuario y genera tokens de acceso.
	usuario = await authenticate_user(db, data.email, data.password)
	if not usuario:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Credenciales invalidas",
		)

	tokens = create_user_tokens(usuario)
	return TokenResponse(**tokens)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(
	data: RefreshTokenRequest,
	db: AsyncSession = Depends(get_db),
) -> TokenResponse:
	# Verifica el refresh token y emite nuevos tokens.
	payload = verify_token(data.refresh_token)
	if not payload:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Refresh token invalido",
		)

	user_id = payload.get("sub") or payload.get("user_id")
	if not user_id:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Refresh token invalido",
		)

	try:
		user_uuid = uuid.UUID(str(user_id))
	except ValueError as exc:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Refresh token invalido",
		) from exc

	usuario = await get_user_by_id(db, user_uuid)
	if not usuario:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Usuario no encontrado",
		)

	tokens = create_user_tokens(usuario)
	return TokenResponse(**tokens)