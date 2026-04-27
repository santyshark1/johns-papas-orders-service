from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_user_dep
from app.models import Permiso, Rol, RolPermiso, Usuario
from app.schemas import (
	MessageResponse,
	PermisoCreate,
	PermisoResponse,
	RoleCreate,
	RoleResponse,
)


router = APIRouter(prefix="/roles", tags=["roles"])

 
def _build_role_response(rol: Rol) -> RoleResponse:
	# Construye la respuesta del rol con sus permisos.
	permisos = [permiso.codigo for permiso in (rol.permisos or []) if permiso and permiso.codigo]
	return RoleResponse(id=rol.id, nombre=rol.nombre, permisos=permisos or [])


@router.get("", response_model=list[RoleResponse])
async def list_roles(
	_: Usuario = Depends(get_current_user_dep),
	db: AsyncSession = Depends(get_db),
) -> list[RoleResponse]:
	# Lista todos los roles con permisos.
	stmt = select(Rol).options(selectinload(Rol.permisos)).order_by(Rol.nombre)
	result = await db.execute(stmt)
	roles = result.scalars().all()
	return [_build_role_response(rol) for rol in roles]


@router.post("", response_model=RoleResponse)
async def create_role(
	data: RoleCreate,
	_: Usuario = Depends(get_current_user_dep),
	db: AsyncSession = Depends(get_db),
) -> RoleResponse:
	# Crea un nuevo rol si el nombre no existe.
	stmt = select(Rol).where(Rol.nombre == data.nombre)
	result = await db.execute(stmt)
	if result.scalars().first():
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="El rol ya existe",
		)

	rol = Rol(nombre=data.nombre)
	db.add(rol)
	await db.commit()
	await db.refresh(rol)
	return _build_role_response(rol)


@router.get("/{rol_id}", response_model=RoleResponse)
async def get_role(
	rol_id: UUID,
	_: Usuario = Depends(get_current_user_dep),
	db: AsyncSession = Depends(get_db),
) -> RoleResponse:
	# Obtiene un rol por ID con sus permisos.
	stmt = (
		select(Rol)
		.where(Rol.id == rol_id)
		.options(selectinload(Rol.permisos))
	)
	result = await db.execute(stmt)
	rol = result.scalars().first()
	if not rol:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Rol no encontrado",
		)
	return _build_role_response(rol)


@router.put("/{rol_id}", response_model=RoleResponse)
async def update_role(
	rol_id: UUID,
	data: RoleCreate,
	_: Usuario = Depends(get_current_user_dep),
	db: AsyncSession = Depends(get_db),
) -> RoleResponse:
	# Actualiza el nombre del rol.
	stmt = select(Rol).where(Rol.id == rol_id)
	result = await db.execute(stmt)
	rol = result.scalars().first()
	if not rol:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Rol no encontrado",
		)

	rol.nombre = data.nombre
	await db.commit()
	await db.refresh(rol)
	return _build_role_response(rol)


@router.delete("/{rol_id}", response_model=MessageResponse)
async def delete_role(
	rol_id: UUID,
	_: Usuario = Depends(get_current_user_dep),
	db: AsyncSession = Depends(get_db),
) -> MessageResponse:
	# Elimina el rol y sus relaciones.
	stmt = delete(Rol).where(Rol.id == rol_id)
	await db.execute(stmt)
	await db.commit()
	return MessageResponse(message="Rol eliminado correctamente", success=True)


@router.get("/permisos", response_model=list[PermisoResponse])
async def list_permisos(
	_: Usuario = Depends(get_current_user_dep),
	db: AsyncSession = Depends(get_db),
) -> list[PermisoResponse]:
	# Lista todos los permisos.
	stmt = select(Permiso).order_by(Permiso.codigo)
	result = await db.execute(stmt)
	permisos = result.scalars().all()
	return [PermisoResponse(id=permiso.id, codigo=permiso.codigo) for permiso in permisos]


@router.post("/permisos", response_model=PermisoResponse)
async def create_permiso(
	data: PermisoCreate,
	_: Usuario = Depends(get_current_user_dep),
	db: AsyncSession = Depends(get_db),
) -> PermisoResponse:
	# Crea un nuevo permiso si el codigo no existe.
	stmt = select(Permiso).where(Permiso.codigo == data.codigo)
	result = await db.execute(stmt)
	if result.scalars().first():
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="El permiso ya existe",
		)

	permiso = Permiso(codigo=data.codigo)
	db.add(permiso)
	await db.commit()
	await db.refresh(permiso)
	return PermisoResponse(id=permiso.id, codigo=permiso.codigo)


@router.post("/{rol_id}/permisos/{permiso_id}", response_model=MessageResponse)
async def assign_permiso(
	rol_id: UUID,
	permiso_id: UUID,
	_: Usuario = Depends(get_current_user_dep),
	db: AsyncSession = Depends(get_db),
) -> MessageResponse:
	# Asigna un permiso a un rol.
	rol_stmt = select(Rol).where(Rol.id == rol_id)
	rol_result = await db.execute(rol_stmt)
	rol = rol_result.scalars().first()
	if not rol:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Rol no encontrado",
		)

	permiso_stmt = select(Permiso).where(Permiso.id == permiso_id)
	permiso_result = await db.execute(permiso_stmt)
	permiso = permiso_result.scalars().first()
	if not permiso:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Permiso no encontrado",
		)

	relation_stmt = select(RolPermiso).where(
		RolPermiso.rol_id == rol_id,
		RolPermiso.permiso_id == permiso_id,
	)
	relation_result = await db.execute(relation_stmt)
	if not relation_result.scalars().first():
		db.add(RolPermiso(rol_id=rol_id, permiso_id=permiso_id))
		await db.commit()

	return MessageResponse(message="Permiso asignado correctamente", success=True)


@router.delete("/{rol_id}/permisos/{permiso_id}", response_model=MessageResponse)
async def remove_permiso(
	rol_id: UUID,
	permiso_id: UUID,
	_: Usuario = Depends(get_current_user_dep),
	db: AsyncSession = Depends(get_db),
) -> MessageResponse:
	# Elimina un permiso de un rol.
	stmt = delete(RolPermiso).where(
		RolPermiso.rol_id == rol_id,
		RolPermiso.permiso_id == permiso_id,
	)
	await db.execute(stmt)
	await db.commit()
	return MessageResponse(message="Permiso removido correctamente", success=True)