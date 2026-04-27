from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user_id, get_db
from app.models import FactInventario
from app.schemas import InventarioMovimientoResponse, InventarioResumenResponse


router = APIRouter(prefix="/reportes/inventario", tags=["inventario-reportes"])
 

def _apply_fecha_filtros(stmt, fecha_desde: datetime | None, fecha_hasta: datetime | None):
	"""Aplica filtros de fecha segun parametros recibidos."""
	if fecha_desde and fecha_hasta:
		return stmt.where(FactInventario.creado_en.between(fecha_desde, fecha_hasta))
	if fecha_desde:
		return stmt.where(FactInventario.creado_en >= fecha_desde)
	if fecha_hasta:
		return stmt.where(FactInventario.creado_en <= fecha_hasta)
	return stmt


@router.get("/movimientos", response_model=list[InventarioMovimientoResponse])
async def listar_movimientos(
	ingrediente_id: str | None = Query(default=None),
	tipo_movimiento: str | None = Query(default=None),
	fecha_desde: datetime | None = Query(default=None),
	fecha_hasta: datetime | None = Query(default=None),
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> list[InventarioMovimientoResponse]:
	"""Lista movimientos de inventario con filtros opcionales."""
	_ = current_user_id
	stmt = select(FactInventario).order_by(FactInventario.creado_en.desc())
	if ingrediente_id:
		stmt = stmt.where(FactInventario.ingrediente_id == ingrediente_id)
	if tipo_movimiento:
		stmt = stmt.where(FactInventario.tipo_movimiento == tipo_movimiento)
	stmt = _apply_fecha_filtros(stmt, fecha_desde, fecha_hasta)
	result = await session.execute(stmt)
	movimientos = result.scalars().all()
	return [
		InventarioMovimientoResponse(
			ingrediente_id=movimiento.ingrediente_id,
			tipo_movimiento=movimiento.tipo_movimiento,
			cantidad=float(movimiento.cantidad) if movimiento.cantidad is not None else None,
			creado_en=movimiento.creado_en,
			ingrediente_nombre=None,
		)
		for movimiento in movimientos
	]


@router.get("/resumen", response_model=list[InventarioResumenResponse])
async def resumen_inventario(
	fecha_desde: datetime | None = Query(default=None),
	fecha_hasta: datetime | None = Query(default=None),
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> list[InventarioResumenResponse]:
	"""Retorna resumen de inventario agrupado por tipo de movimiento."""
	_ = current_user_id
	stmt = select(
		FactInventario.tipo_movimiento,
		func.coalesce(func.sum(FactInventario.cantidad), 0),
		func.count(FactInventario.id),
	).group_by(FactInventario.tipo_movimiento)
	stmt = _apply_fecha_filtros(stmt, fecha_desde, fecha_hasta)
	result = await session.execute(stmt)
	rows = result.all()
	return [
		InventarioResumenResponse(
			tipo_movimiento=row[0],
			total_cantidad=float(row[1] or 0),
			cantidad_registros=int(row[2] or 0),
		)
		for row in rows
	]
