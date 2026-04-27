from __future__ import annotations

import datetime as dt
import secrets
from decimal import Decimal
from typing import Iterable
from uuid import UUID
 
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.clients import descontar_stock, validar_cliente
from app.deps import get_current_user_id, get_db
from app.models import (
	DireccionServicio,
	HistorialEstadoPedido,
	ItemPedido,
	OpcionSeleccionadaItemPedido,
	Pedido,
)
from app.schemas import (
	DireccionResponse,
	EstadoUpdateRequest,
	ItemPedidoResponse,
	OpcionSeleccionadaResponse,
	PedidoCreate,
	PedidoResponse,
)

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def _generate_numero_orden() -> str:
	"""Genera un numero de orden unico."""
	timestamp = dt.datetime.utcnow().strftime("%Y%m%d%H%M%S")
	return f"ORD-{timestamp}-{secrets.randbelow(1000):03d}"


def _to_decimal(value: float) -> Decimal:
	"""Convierte un float a Decimal de forma segura."""
	return Decimal(str(value))


def _build_pedido_response(pedido: Pedido) -> PedidoResponse:
	"""Construye la respuesta de pedido con relaciones cargadas."""
	items = [
		ItemPedidoResponse(
			id=item.id,
			producto_id=item.producto_id,
			cantidad=item.cantidad,
			precio_unitario_snapshot=float(item.precio_unitario_snapshot),
			total_item=float(item.total_item),
			nombre_producto_snapshot=item.nombre_producto_snapshot,
			sku_producto_snapshot=item.sku_producto_snapshot,
			impuesto_item=float(item.impuesto_item),
			descuento_item=float(item.descuento_item),
			variantes_json=item.variantes_json,
			notas=item.notas,
			opciones_seleccionadas=[
				OpcionSeleccionadaResponse(
					id=opcion.id,
					opcion_id=opcion.opcion_id,
					tipo_opcion_snapshot=opcion.tipo_opcion_snapshot,
					codigo_opcion_snapshot=opcion.codigo_opcion_snapshot,
					etiqueta_opcion_snapshot=opcion.etiqueta_opcion_snapshot,
				)
				for opcion in item.opciones_seleccionadas
			],
		)
		for item in pedido.items
	]

	direcciones = [
		DireccionResponse(
			id=direccion.id,
			tipo=direccion.tipo,
			numero1=direccion.numero1,
			numero2=direccion.numero2,
			calle=direccion.calle,
			ciudad=direccion.ciudad,
		)
		for direccion in pedido.direcciones_servicio
	]

	return PedidoResponse(
		id=pedido.id,
		numero_orden=pedido.numero_orden,
		cliente_id=pedido.cliente_id,
		cliente_nombre=pedido.cliente_nombre,
		cliente_email=pedido.cliente_email,
		tienda_id=pedido.tienda_id,
		tienda_nombre=pedido.tienda_nombre,
		plataforma=pedido.plataforma,
		entrega=pedido.entrega,
		estado=pedido.estado,
		subtotal=float(pedido.subtotal),
		impuestos=float(pedido.impuestos),
		servicio=float(pedido.servicio),
		descuento=float(pedido.descuento),
		total=float(pedido.total),
		creado_en=pedido.creado_en,
		items=items,
		direcciones=direcciones or None,
	)


def _parse_user_id(user_id: str) -> UUID:
	"""Convierte el user_id del token a UUID."""
	try:
		return UUID(user_id)
	except ValueError as exc:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Identificador de usuario invalido",
		) from exc


async def _load_pedido(
	session: AsyncSession,
	pedido_id: UUID,
) -> Pedido | None:
	"""Carga un pedido con sus relaciones."""
	result = await session.execute(
		select(Pedido)
		.where(Pedido.id == pedido_id)
		.options(
			selectinload(Pedido.items).selectinload(ItemPedido.opciones_seleccionadas),
			selectinload(Pedido.direcciones_servicio),
		)
	)
	return result.scalar_one_or_none()


@router.post("", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED)
async def crear_pedido(
	payload: PedidoCreate,
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> PedidoResponse:
	"""Crea un pedido con sus items y direccion."""
	cliente_uuid = _parse_user_id(current_user_id)
	if payload.cliente_id != cliente_uuid:
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="No puedes crear pedidos para otro cliente",
		)

	if payload.entrega == "DOMICILIO" and payload.direccion is None:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Direccion requerida para entrega a domicilio",
		)

	if not await validar_cliente(payload.cliente_id):
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Cliente no encontrado",
		)

	stock_items = [
		{"ingrediente_id": item.producto_id, "cantidad": item.cantidad}
		for item in payload.items
	]
	if not await descontar_stock(stock_items):
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="Sin stock disponible",
		)

	subtotal = sum(
		(_to_decimal(item.precio_unitario_snapshot) * item.cantidad)
		for item in payload.items
	)
	impuestos = sum(_to_decimal(item.impuesto_item) for item in payload.items)
	descuento = sum(_to_decimal(item.descuento_item) for item in payload.items)
	servicio = Decimal("0")
	total = subtotal + impuestos + servicio - descuento

	pedido = Pedido(
		numero_orden=_generate_numero_orden(),
		cliente_id=payload.cliente_id,
		cliente_nombre=payload.cliente_nombre,
		cliente_email=str(payload.cliente_email),
		cliente_telefono=payload.cliente_telefono,
		tienda_id=payload.tienda_id,
		tienda_nombre=payload.tienda_nombre,
		plataforma=payload.plataforma,
		entrega=payload.entrega,
		estado="BORRADOR",
		subtotal=subtotal,
		impuestos=impuestos,
		servicio=servicio,
		descuento=descuento,
		total=total,
	)

	items: list[ItemPedido] = []
	for item in payload.items:
		item_model = ItemPedido(
			producto_id=item.producto_id,
			cantidad=item.cantidad,
			precio_unitario_snapshot=_to_decimal(item.precio_unitario_snapshot),
			total_item=_to_decimal(item.precio_unitario_snapshot) * item.cantidad,
			nombre_producto_snapshot=item.nombre_producto_snapshot,
			sku_producto_snapshot=item.sku_producto_snapshot or "",
			impuesto_item=_to_decimal(item.impuesto_item),
			descuento_item=_to_decimal(item.descuento_item),
			variantes_json=item.variantes_json,
			notas=item.notas or "",
		)
		for opcion in item.opciones_seleccionadas or []:
			item_model.opciones_seleccionadas.append(
				OpcionSeleccionadaItemPedido(
					opcion_id=opcion.opcion_id,
					tipo_opcion_snapshot=opcion.tipo_opcion_snapshot,
					codigo_opcion_snapshot=opcion.codigo_opcion_snapshot,
					etiqueta_opcion_snapshot=opcion.etiqueta_opcion_snapshot,
				)
			)
		items.append(item_model)

	pedido.items = items

	if payload.direccion:
		pedido.direcciones_servicio.append(
			DireccionServicio(
				tipo=payload.direccion.tipo,
				numero1=payload.direccion.numero1,
				numero2=payload.direccion.numero2,
				calle=payload.direccion.calle,
				ciudad=payload.direccion.ciudad,
			)
		)

	try:
		session.add(pedido)
		await session.commit()
		await session.refresh(pedido)
		existing = await _load_pedido(session, pedido.id)
		if not existing:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail="No se pudo recuperar el pedido creado",
			)
		return _build_pedido_response(existing)
	except HTTPException:
		await session.rollback()
		raise
	except Exception as exc:
		await session.rollback()
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail="Error al crear el pedido",
		) from exc


@router.get("", response_model=list[PedidoResponse])
async def listar_pedidos(
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> list[PedidoResponse]:
	"""Lista los pedidos del usuario autenticado."""
	cliente_uuid = _parse_user_id(current_user_id)
	try:
		result = await session.execute(
			select(Pedido)
			.where(Pedido.cliente_id == cliente_uuid)
			.order_by(Pedido.creado_en.desc())
			.options(
				selectinload(Pedido.items).selectinload(ItemPedido.opciones_seleccionadas),
				selectinload(Pedido.direcciones_servicio),
			)
		)
		pedidos: Iterable[Pedido] = result.scalars().all()
		return [_build_pedido_response(pedido) for pedido in pedidos]
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail="Error al obtener los pedidos. Intenta de nuevo.",
		) from exc


@router.get("/{pedido_id}", response_model=PedidoResponse)
async def obtener_pedido(
	pedido_id: UUID,
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> PedidoResponse:
	"""Obtiene un pedido por id."""
	cliente_uuid = _parse_user_id(current_user_id)
	pedido = await _load_pedido(session, pedido_id)
	if not pedido:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Pedido no encontrado",
		)
	if pedido.cliente_id != cliente_uuid:
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="No tienes acceso a este pedido",
		)
	return _build_pedido_response(pedido)


@router.put("/{pedido_id}/cancelar", response_model=PedidoResponse)
async def cancelar_pedido(
	pedido_id: UUID,
	reason: str | None = Query(default=None, alias="razon"),
	current_user_id: str = Depends(get_current_user_id),
	session: AsyncSession = Depends(get_db),
) -> PedidoResponse:
	"""Cancela un pedido en estado BORRADOR o EN_PROCESO."""
	cliente_uuid = _parse_user_id(current_user_id)
	pedido = await _load_pedido(session, pedido_id)
	if not pedido:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Pedido no encontrado",
		)
	if pedido.cliente_id != cliente_uuid:
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="No tienes acceso a este pedido",
		)
	if pedido.estado not in {"BORRADOR", "EN_PROCESO"}:
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="El pedido no puede cancelarse en su estado actual",
		)

	estado_anterior = pedido.estado
	pedido.estado = "CANCELADO"
	pedido.historial_estados.append(
		HistorialEstadoPedido(
			estado_anterior=estado_anterior,
			estado_nuevo="CANCELADO",
			cambiado_por=str(cliente_uuid),
			razon=reason or "",
		)
	)

	try:
		await session.commit()
		await session.refresh(pedido)
		pedido = await _load_pedido(session, pedido.id)
		if not pedido:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail="No se pudo recuperar el pedido actualizado",
			)
		return _build_pedido_response(pedido)
	except HTTPException:
		await session.rollback()
		raise
	except Exception as exc:
		await session.rollback()
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail="Error al cancelar el pedido",
		) from exc
