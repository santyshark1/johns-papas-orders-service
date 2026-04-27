from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
 
from app.deps import get_current_user_id, get_db
from app.models import HistorialEstadoPedido, Pedido
from app.schemas import EstadoHistoryResponse

router = APIRouter(prefix="/pedidos/{pedido_id}/estados", tags=["estados"])


def _parse_user_id(user_id: str) -> UUID:
	"""Convierte el user_id del token a UUID."""
	try:
		return UUID(user_id)
	except ValueError as exc:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Identificador de usuario invalido",
		) from exc


@router.get("", response_model=list[EstadoHistoryResponse])
async def listar_historial_estados(
	pedido_id: UUID,
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> list[EstadoHistoryResponse]:
	"""Lista el historial de estados de un pedido."""
	cliente_uuid = _parse_user_id(current_user_id)
	result = await session.execute(
		select(Pedido.id).where(
			Pedido.id == pedido_id,
			Pedido.cliente_id == cliente_uuid,
		)
	)
	if result.scalar_one_or_none() is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Pedido no encontrado",
		)

	historial_result = await session.execute(
		select(HistorialEstadoPedido)
		.where(HistorialEstadoPedido.pedido_id == pedido_id)
		.order_by(HistorialEstadoPedido.cambiado_en.desc())
	)
	historial = historial_result.scalars().all()
	return [EstadoHistoryResponse.model_validate(item) for item in historial]
