from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.deps import get_current_user_dep
from app.models import Rol, Usuario, UsuarioRol
from app.schemas import AssignRoleRequest, MessageResponse, UsuarioResponse
from app.database import get_db


router = APIRouter(prefix="/usuarios", tags=["usuarios"])


def _build_usuario_response(usuario: Usuario) -> UsuarioResponse:
	# Construye la respuesta segura del usuario (sin password).
	roles = [rol.nombre for rol in (usuario.roles or []) if rol and rol.nombre]
	return UsuarioResponse(
		id=usuario.id,
		nombre=usuario.nombre,
		email=usuario.email,
		roles=roles,
	)


@router.get("", response_model=list[UsuarioResponse])
async def list_usuarios(
	_: Usuario = Depends(get_current_user_dep),
	db: AsyncSession = Depends(get_db),
) -> list[UsuarioResponse]:
	# Lista todos los usuarios con sus roles.
	stmt = select(Usuario).options(selectinload(Usuario.roles))
	result = await db.execute(stmt)
	usuarios = result.scalars().all()
	return [_build_usuario_response(usuario) for usuario in usuarios]


@router.get("/{usuario_id}", response_model=UsuarioResponse)
async def get_usuario_by_id(
	usuario_id: UUID,
	_: Usuario = Depends(get_current_user_dep),
	db: AsyncSession = Depends(get_db),
) -> UsuarioResponse:
	# Obtiene un usuario especifico por ID.
	stmt = (
		select(Usuario)
		.where(Usuario.id == usuario_id)
		.options(selectinload(Usuario.roles))
	)
	result = await db.execute(stmt)
	usuario = result.scalars().first()
	if not usuario:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Usuario no encontrado",
		)
	return _build_usuario_response(usuario)


@router.put("/{usuario_id}/roles", response_model=MessageResponse)
async def assign_role(
	usuario_id: UUID,
	data: AssignRoleRequest,
	_: Usuario = Depends(get_current_user_dep),
	db: AsyncSession = Depends(get_db),
) -> MessageResponse:
	# Asigna un rol a un usuario (si no existe la relacion).
	user_stmt = select(Usuario).where(Usuario.id == usuario_id)
	user_result = await db.execute(user_stmt)
	usuario = user_result.scalars().first()
	if not usuario:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Usuario no encontrado",
		)

	role_stmt = select(Rol).where(Rol.id == data.rol_id)
	role_result = await db.execute(role_stmt)
	rol = role_result.scalars().first()
	if not rol:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Rol no encontrado",
		)

	relation_stmt = select(UsuarioRol).where(
		UsuarioRol.usuario_id == usuario_id,
		UsuarioRol.rol_id == data.rol_id,
		UsuarioRol.tienda_id == data.tienda_id,
	)
	relation_result = await db.execute(relation_stmt)
	if not relation_result.scalars().first():
		db.add(
			UsuarioRol(
				usuario_id=usuario_id,
				rol_id=data.rol_id,
				tienda_id=data.tienda_id,
			)
		)
		await db.commit()

	return MessageResponse(message="Rol asignado correctamente", success=True)


@router.delete("/{usuario_id}/roles/{rol_id}", response_model=MessageResponse)
async def remove_role(
	usuario_id: UUID,
	rol_id: UUID,
	_: Usuario = Depends(get_current_user_dep),
	db: AsyncSession = Depends(get_db),
) -> MessageResponse:
	# Elimina la relacion entre usuario y rol (todas las tiendas).
	stmt = delete(UsuarioRol).where(
		UsuarioRol.usuario_id == usuario_id,
		UsuarioRol.rol_id == rol_id,
	)
	await db.execute(stmt)
	await db.commit()

	return MessageResponse(message="Rol removido correctamente", success=True)
