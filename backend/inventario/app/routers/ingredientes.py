from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user_id, get_db
from app.models import Ingrediente
from app.schemas import (
	IngredienteCreate,
	IngredienteResponse,
	IngredienteUpdate,
	MessageResponse,
)
 
router = APIRouter(prefix="/ingredientes", tags=["ingredientes"])


def _build_ingrediente_response(ingrediente: Ingrediente) -> IngredienteResponse:
	"""Construye la respuesta de ingrediente."""
	return IngredienteResponse(
		id=ingrediente.id,
		nombre=ingrediente.nombre,
		stock_actual=float(ingrediente.stock_actual),
		costo_unitario=float(ingrediente.costo_unitario),
	)


@router.get("", response_model=list[IngredienteResponse])
async def listar_ingredientes(
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> list[IngredienteResponse]:
	"""Lista todos los ingredientes ordenados por nombre."""
	result = await session.execute(select(Ingrediente).order_by(Ingrediente.nombre))
	return [_build_ingrediente_response(item) for item in result.scalars().all()]


@router.get("/{ingrediente_id}", response_model=IngredienteResponse)
async def obtener_ingrediente(
	ingrediente_id: UUID,
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> IngredienteResponse:
	"""Obtiene un ingrediente por id."""
	result = await session.execute(select(Ingrediente).where(Ingrediente.id == ingrediente_id))
	ingrediente = result.scalar_one_or_none()
	if not ingrediente:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Ingrediente no encontrado",
		)
	return _build_ingrediente_response(ingrediente)


@router.post("", response_model=IngredienteResponse, status_code=status.HTTP_201_CREATED)
async def crear_ingrediente(
	payload: IngredienteCreate,
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> IngredienteResponse:
	"""Crea un ingrediente nuevo."""
	result = await session.execute(
		select(Ingrediente).where(Ingrediente.nombre == payload.nombre)
	)
	if result.scalar_one_or_none():
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="Nombre de ingrediente ya existe",
		)

	ingrediente = Ingrediente(
		nombre=payload.nombre,
		stock_actual=payload.stock_actual,
		costo_unitario=payload.costo_unitario,
	)
	session.add(ingrediente)
	await session.commit()
	await session.refresh(ingrediente)
	return _build_ingrediente_response(ingrediente)


@router.put("/{ingrediente_id}", response_model=IngredienteResponse)
async def actualizar_ingrediente(
	ingrediente_id: UUID,
	payload: IngredienteUpdate,
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> IngredienteResponse:
	"""Actualiza el stock o costo del ingrediente."""
	result = await session.execute(select(Ingrediente).where(Ingrediente.id == ingrediente_id))
	ingrediente = result.scalar_one_or_none()
	if not ingrediente:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Ingrediente no encontrado",
		)

	if payload.stock_actual is not None:
		ingrediente.stock_actual = payload.stock_actual
	if payload.costo_unitario is not None:
		ingrediente.costo_unitario = payload.costo_unitario

	await session.commit()
	await session.refresh(ingrediente)
	return _build_ingrediente_response(ingrediente)


@router.delete("/{ingrediente_id}", response_model=MessageResponse)
async def eliminar_ingrediente(
	ingrediente_id: UUID,
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> MessageResponse:
	"""Elimina un ingrediente si no tiene movimientos asociados."""
	result = await session.execute(select(Ingrediente).where(Ingrediente.id == ingrediente_id))
	ingrediente = result.scalar_one_or_none()
	if not ingrediente:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Ingrediente no encontrado",
		)

	try:
		await session.delete(ingrediente)
		await session.commit()
	except IntegrityError as exc:
		await session.rollback()
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="No se puede eliminar: tiene movimientos asociados",
		) from exc

	return MessageResponse(message="Ingrediente eliminado", success=True)
