from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.deps import get_current_user_id, get_db
from app.models import Ingrediente, MovimientoInventario
from app.schemas import (
	DescontarDetalle,
	DescontarStockRequest,
	DescontarStockResponse,
	MovimientoCreate,
	MovimientoResponse,
)

router = APIRouter(prefix="/inventario", tags=["inventario"])


def _build_movimiento_response(movimiento: MovimientoInventario) -> MovimientoResponse:
	"""Construye la respuesta de movimiento."""
	ingrediente_nombre = movimiento.ingrediente.nombre if movimiento.ingrediente else None
	return MovimientoResponse(
		id=movimiento.id,
		ingrediente_id=movimiento.ingrediente_id,
		tipo_movimiento=movimiento.tipo_movimiento,
		cantidad=float(movimiento.cantidad) if movimiento.cantidad is not None else None,
		creado_en=movimiento.creado_en,
		ingrediente_nombre=ingrediente_nombre,
	)


def _apply_stock_change(
	ingrediente: Ingrediente,
	tipo_movimiento: str,
	cantidad: float,
) -> None:
	"""Actualiza el stock segun el tipo de movimiento."""
	if tipo_movimiento == "ENTRADA":
		ingrediente.stock_actual = ingrediente.stock_actual + cantidad
	elif tipo_movimiento == "SALIDA":
		ingrediente.stock_actual = ingrediente.stock_actual - cantidad
	elif tipo_movimiento == "AJUSTE":
		ingrediente.stock_actual = cantidad


@router.post(
	"/descontar",
	response_model=DescontarStockResponse,
)
async def descontar_stock(
	payload: DescontarStockRequest,
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> DescontarStockResponse:
	"""Descuenta stock para una lista de ingredientes de forma transaccional."""
	detalles: list[DescontarDetalle] = []
	transaccion = await session.begin()
	try:
		for item in payload.items:
			result = await session.execute(
				select(Ingrediente).where(Ingrediente.id == item.ingrediente_id)
			)
			ingrediente = result.scalar_one_or_none()
			if not ingrediente:
				detalles.append(
					DescontarDetalle(
						ingrediente_id=item.ingrediente_id,
						ingrediente_nombre="",
						cantidad_solicitada=item.cantidad,
						stock_actual=0,
						success=False,
						mensaje="Ingrediente no encontrado",
					)
				)
				await transaccion.rollback()
				return DescontarStockResponse(
					success=False,
					mensaje="No se pudo descontar stock",
					detalles=detalles,
				)

			stock_actual = float(ingrediente.stock_actual)
			if stock_actual < item.cantidad:
				detalles.append(
					DescontarDetalle(
						ingrediente_id=item.ingrediente_id,
						ingrediente_nombre=ingrediente.nombre,
						cantidad_solicitada=item.cantidad,
						stock_actual=stock_actual,
						success=False,
						mensaje="Stock insuficiente",
					)
				)
				await transaccion.rollback()
				return DescontarStockResponse(
					success=False,
					mensaje="No se pudo descontar stock",
					detalles=detalles,
				)

			ingrediente.stock_actual = ingrediente.stock_actual - item.cantidad
			movimiento = MovimientoInventario(
				ingrediente_id=ingrediente.id,
				tipo_movimiento="SALIDA",
				cantidad=item.cantidad,
			)
			session.add(movimiento)
			detalles.append(
				DescontarDetalle(
					ingrediente_id=item.ingrediente_id,
					ingrediente_nombre=ingrediente.nombre,
					cantidad_solicitada=item.cantidad,
					stock_actual=float(ingrediente.stock_actual),
					success=True,
					mensaje="Stock actualizado",
				)
			)

		await transaccion.commit()
		return DescontarStockResponse(
			success=True,
			mensaje="Descuento procesado",
			detalles=detalles,
		)
	finally:
		if transaccion.is_active:
			await transaccion.rollback()


@router.post(
	"/movimientos",
	response_model=MovimientoResponse,
	status_code=status.HTTP_201_CREATED,
)
async def crear_movimiento(
	payload: MovimientoCreate,
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> MovimientoResponse:
	"""Registra un movimiento manual de inventario."""
	result = await session.execute(
		select(Ingrediente).where(Ingrediente.id == payload.ingrediente_id)
	)
	ingrediente = result.scalar_one_or_none()
	if not ingrediente:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Ingrediente no encontrado",
		)

	_apply_stock_change(ingrediente, payload.tipo_movimiento, payload.cantidad)

	movimiento = MovimientoInventario(
		ingrediente_id=ingrediente.id,
		tipo_movimiento=payload.tipo_movimiento,
		cantidad=payload.cantidad,
	)
	session.add(movimiento)
	await session.commit()
	await session.refresh(movimiento)

	movimiento.ingrediente = ingrediente
	return _build_movimiento_response(movimiento)


@router.get("/movimientos", response_model=list[MovimientoResponse])
async def listar_movimientos(
	ingrediente_id: UUID | None = Query(default=None),
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> list[MovimientoResponse]:
	"""Lista movimientos de inventario, con filtro opcional por ingrediente."""
	stmt = select(MovimientoInventario).options(selectinload(MovimientoInventario.ingrediente))
	if ingrediente_id:
		stmt = stmt.where(MovimientoInventario.ingrediente_id == ingrediente_id)
	stmt = stmt.order_by(MovimientoInventario.creado_en.desc())

	result = await session.execute(stmt)
	return [_build_movimiento_response(item) for item in result.scalars().all()]


@router.get("/movimientos/{ingrediente_id}", response_model=list[MovimientoResponse])
async def listar_movimientos_por_ingrediente(
	ingrediente_id: UUID,
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> list[MovimientoResponse]:
	"""Lista movimientos de un ingrediente especifico."""
	result = await session.execute(
		select(MovimientoInventario)
		.where(MovimientoInventario.ingrediente_id == ingrediente_id)
		.options(selectinload(MovimientoInventario.ingrediente))
		.order_by(MovimientoInventario.creado_en.desc())
	)
	return [_build_movimiento_response(item) for item in result.scalars().all()]
