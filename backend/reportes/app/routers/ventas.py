from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user_id, get_db
from app.models import FactVenta
from app.schemas import VentaReportResponse, VentaResumenResponse


router = APIRouter(prefix="/reportes/ventas", tags=["ventas"])


def _apply_fecha_filtros(stmt, fecha_desde: datetime | None, fecha_hasta: datetime | None):
	"""Aplica filtros de fecha segun parametros recibidos."""
	if fecha_desde and fecha_hasta:
		return stmt.where(FactVenta.creado_en.between(fecha_desde, fecha_hasta))
	if fecha_desde:
		return stmt.where(FactVenta.creado_en >= fecha_desde)
	if fecha_hasta:
		return stmt.where(FactVenta.creado_en <= fecha_hasta)
	return stmt


@router.get("", response_model=list[VentaReportResponse])
async def listar_ventas(
	fecha_desde: datetime | None = Query(default=None),
	fecha_hasta: datetime | None = Query(default=None),
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> list[VentaReportResponse]:
	"""Lista ventas con filtros opcionales de fecha."""
	_ = current_user_id
	stmt = select(FactVenta).order_by(FactVenta.creado_en.desc())
	stmt = _apply_fecha_filtros(stmt, fecha_desde, fecha_hasta)
	result = await session.execute(stmt)
	ventas = result.scalars().all()
	return [
		VentaReportResponse(
			pedido_id=venta.pedido_id,
			numero_orden=venta.numero_orden,
			total=float(venta.total) if venta.total is not None else None,
			creado_en=venta.creado_en,
		)
		for venta in ventas
	]


@router.get("/resumen", response_model=VentaResumenResponse)
async def resumen_ventas(
	fecha_desde: datetime | None = Query(default=None),
	fecha_hasta: datetime | None = Query(default=None),
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> VentaResumenResponse:
	"""Retorna resumen de ventas para un periodo."""
	_ = current_user_id
	stmt = select(
		func.count(FactVenta.id),
		func.coalesce(func.sum(FactVenta.total), 0),
	)
	stmt = _apply_fecha_filtros(stmt, fecha_desde, fecha_hasta)
	result = await session.execute(stmt)
	total_ventas, ingresos_totales = result.one()

	total_ventas_int = int(total_ventas or 0)
	ingresos_float = float(ingresos_totales or 0)
	if total_ventas_int > 0:
		promedio = ingresos_float / total_ventas_int
	else:
		promedio = 0.0

	return VentaResumenResponse(
		total_ventas=total_ventas_int,
		ingresos_totales=ingresos_float,
		promedio_venta=promedio,
		fecha_desde=fecha_desde or datetime.min,
		fecha_hasta=fecha_hasta or datetime.max,
	)
