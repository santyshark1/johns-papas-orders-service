from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user_id, get_db
from app.models import Auditoria, Auditoria2025
from app.schemas import AuditoriaResponse


router = APIRouter(prefix="/reportes/auditoria", tags=["auditoria"])


def _apply_filtros(
	stmt,
	usuario_id: str | None,
	accion: str | None,
	fecha_desde: datetime | None,
	fecha_hasta: datetime | None,
):
	"""Aplica filtros de auditoria segun parametros recibidos."""
	if usuario_id:
		stmt = stmt.where(Auditoria.usuario_id == usuario_id)
	if accion:
		stmt = stmt.where(Auditoria.accion == accion)
	if fecha_desde and fecha_hasta:
		stmt = stmt.where(Auditoria.creado_en.between(fecha_desde, fecha_hasta))
	elif fecha_desde:
		stmt = stmt.where(Auditoria.creado_en >= fecha_desde)
	elif fecha_hasta:
		stmt = stmt.where(Auditoria.creado_en <= fecha_hasta)
	return stmt


def _build_union(
	usuario_id: str | None,
	accion: str | None,
	fecha_desde: datetime | None,
	fecha_hasta: datetime | None,
):
	stmt_auditoria = _apply_filtros(
		select(
			Auditoria.id,
			Auditoria.usuario_id,
			Auditoria.accion,
			Auditoria.creado_en,
		),
		usuario_id,
		accion,
		fecha_desde,
		fecha_hasta,
	)
	stmt_auditoria_2025 = _apply_filtros(
		select(
			Auditoria2025.id,
			Auditoria2025.usuario_id,
			Auditoria2025.accion,
			Auditoria2025.creado_en,
		),
		usuario_id,
		accion,
		fecha_desde,
		fecha_hasta,
	)
	return stmt_auditoria.union_all(stmt_auditoria_2025).subquery()


@router.get("", response_model=list[AuditoriaResponse])
async def listar_auditoria(
	usuario_id: str | None = Query(default=None),
	accion: str | None = Query(default=None),
	fecha_desde: datetime | None = Query(default=None),
	fecha_hasta: datetime | None = Query(default=None),
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> list[AuditoriaResponse]:
	"""Lista eventos de auditoria con filtros opcionales."""
	_ = current_user_id
	union_subquery = _build_union(usuario_id, accion, fecha_desde, fecha_hasta)
	stmt = (
		select(
			union_subquery.c.id,
			union_subquery.c.usuario_id,
			union_subquery.c.accion,
			union_subquery.c.creado_en,
		)
		.order_by(desc(union_subquery.c.creado_en))
		.limit(1000)
	)
	result = await session.execute(stmt)
	rows = result.all()
	return [
		AuditoriaResponse(
			id=row.id,
			usuario_id=row.usuario_id,
			accion=row.accion,
			creado_en=row.creado_en,
		)
		for row in rows
	]
