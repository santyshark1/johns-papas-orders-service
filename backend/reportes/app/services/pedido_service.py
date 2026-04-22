from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.models import (
    DireccionServicio,
    EstadoPedido,
    HistorialEstadoPedido,
    ItemPedido,
    OpcionSeleccionadaItemPedido,
    Pedido,
)
from app.schemas.schemas import PedidoCreate, PedidoEstadoUpdate, PedidoUpdate


def _pedido_query():
    return (
        select(Pedido)
        .options(
            selectinload(Pedido.direcciones),
            selectinload(Pedido.items).selectinload(ItemPedido.opciones_seleccionadas),
            selectinload(Pedido.historial_estados),
        )
        .order_by(Pedido.creado_en.desc())
    )


def _get_pedido_or_404(db: Session, pedido_id: UUID) -> Pedido:
    pedido = db.scalar(_pedido_query().where(Pedido.id == pedido_id))
    if not pedido:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
    return pedido


def list_pedidos(db: Session) -> list[Pedido]:
    return list(db.scalars(_pedido_query()).all())


def get_pedido(db: Session, pedido_id: UUID) -> Pedido:
    return _get_pedido_or_404(db, pedido_id)


def _apply_payload_to_pedido(pedido: Pedido, data: PedidoCreate | PedidoUpdate) -> None:
    pedido.numero_orden = data.numero_orden
    pedido.cliente_id = data.cliente_id
    pedido.cliente_nombre = data.cliente_nombre
    pedido.cliente_email = data.cliente_email
    pedido.cliente_telefono = data.cliente_telefono
    pedido.tienda_id = data.tienda_id
    pedido.tienda_nombre = data.tienda_nombre
    pedido.plataforma = data.plataforma.value
    pedido.entrega = data.entrega.value
    pedido.moneda = data.moneda
    pedido.subtotal = Decimal(data.subtotal)
    pedido.impuestos = Decimal(data.impuestos)
    pedido.servicio = Decimal(data.servicio)
    pedido.descuento = Decimal(data.descuento)
    pedido.total = Decimal(data.total)
    pedido.codigo_descuento = data.codigo_descuento
    pedido.tiempo_servicio = data.tiempo_servicio
    pedido.completado_en = data.completado_en


def create_pedido(db: Session, payload: PedidoCreate) -> Pedido:
    exists = db.scalar(select(Pedido.id).where(Pedido.numero_orden == payload.numero_orden))
    if exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un pedido con ese numero_orden",
        )

    pedido = Pedido(estado=EstadoPedido.BORRADOR.value)
    _apply_payload_to_pedido(pedido, payload)

    for direccion in payload.direcciones:
        pedido.direcciones.append(
            DireccionServicio(
                tipo=direccion.tipo.value,
                numero1=direccion.numero1,
                numero2=direccion.numero2,
                calle=direccion.calle,
                ciudad=direccion.ciudad,
            )
        )

    for item in payload.items:
        item_model = ItemPedido(
            producto_id=item.producto_id,
            nombre_producto_snapshot=item.nombre_producto_snapshot,
            sku_producto_snapshot=item.sku_producto_snapshot,
            precio_unitario_snapshot=item.precio_unitario_snapshot,
            cantidad=item.cantidad,
            subtotal_snapshot=item.subtotal_snapshot,
            impuesto_item=item.impuesto_item,
            descuento_item=item.descuento_item,
            total_item=item.total_item,
            variantes_json=item.variantes_json,
            notas=item.notas,
        )

        for opcion in item.opciones_seleccionadas:
            item_model.opciones_seleccionadas.append(
                OpcionSeleccionadaItemPedido(
                    opcion_id=opcion.opcion_id,
                    tipo_opcion_snapshot=opcion.tipo_opcion_snapshot,
                    codigo_opcion_snapshot=opcion.codigo_opcion_snapshot,
                    etiqueta_opcion_snapshot=opcion.etiqueta_opcion_snapshot,
                )
            )

        pedido.items.append(item_model)

    db.add(pedido)
    db.commit()
    db.refresh(pedido)
    return _get_pedido_or_404(db, pedido.id)


def update_pedido(db: Session, pedido_id: UUID, payload: PedidoUpdate) -> Pedido:
    pedido = _get_pedido_or_404(db, pedido_id)

    duplicated_order = db.scalar(
        select(Pedido.id).where(Pedido.numero_orden == payload.numero_orden, Pedido.id != pedido.id)
    )
    if duplicated_order:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un pedido con ese numero_orden",
        )

    _apply_payload_to_pedido(pedido, payload)
    pedido.estado = payload.estado.value

    pedido.direcciones.clear()
    pedido.items.clear()

    for direccion in payload.direcciones:
        pedido.direcciones.append(
            DireccionServicio(
                tipo=direccion.tipo.value,
                numero1=direccion.numero1,
                numero2=direccion.numero2,
                calle=direccion.calle,
                ciudad=direccion.ciudad,
            )
        )

    for item in payload.items:
        item_model = ItemPedido(
            producto_id=item.producto_id,
            nombre_producto_snapshot=item.nombre_producto_snapshot,
            sku_producto_snapshot=item.sku_producto_snapshot,
            precio_unitario_snapshot=item.precio_unitario_snapshot,
            cantidad=item.cantidad,
            subtotal_snapshot=item.subtotal_snapshot,
            impuesto_item=item.impuesto_item,
            descuento_item=item.descuento_item,
            total_item=item.total_item,
            variantes_json=item.variantes_json,
            notas=item.notas,
        )

        for opcion in item.opciones_seleccionadas:
            item_model.opciones_seleccionadas.append(
                OpcionSeleccionadaItemPedido(
                    opcion_id=opcion.opcion_id,
                    tipo_opcion_snapshot=opcion.tipo_opcion_snapshot,
                    codigo_opcion_snapshot=opcion.codigo_opcion_snapshot,
                    etiqueta_opcion_snapshot=opcion.etiqueta_opcion_snapshot,
                )
            )

        pedido.items.append(item_model)

    db.commit()
    db.refresh(pedido)
    return _get_pedido_or_404(db, pedido.id)


def cancel_pedido(db: Session, pedido_id: UUID, cambiado_por: str = "system") -> None:
    pedido = _get_pedido_or_404(db, pedido_id)
    estado_anterior = pedido.estado
    pedido.estado = EstadoPedido.CANCELADO.value
    pedido.historial_estados.append(
        HistorialEstadoPedido(
            estado_anterior=estado_anterior,
            estado_nuevo=EstadoPedido.CANCELADO.value,
            cambiado_por=cambiado_por,
            razon="Cancelacion solicitada",
        )
    )
    db.commit()


def change_estado(db: Session, pedido_id: UUID, payload: PedidoEstadoUpdate) -> Pedido:
    pedido = _get_pedido_or_404(db, pedido_id)
    estado_anterior = pedido.estado
    pedido.estado = payload.estado_nuevo.value

    pedido.historial_estados.append(
        HistorialEstadoPedido(
            estado_anterior=estado_anterior,
            estado_nuevo=payload.estado_nuevo.value,
            cambiado_por=payload.cambiado_por,
            razon=payload.razon,
        )
    )

    db.commit()
    db.refresh(pedido)
    return _get_pedido_or_404(db, pedido.id)
