from __future__ import annotations

import datetime as dt
import uuid

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
	"""Base declarativa para los modelos."""


# Tabla principal de pedidos.
class Pedido(Base):
	__tablename__ = "pedidos"
	__table_args__ = (
		sa.Index("ix_pedidos_cliente_id", "cliente_id"),
		sa.Index("ix_pedidos_estado", "estado"),
		sa.Index("ix_pedidos_creado_en", "creado_en"),
		{"comment": "Tabla de pedidos"},
	)

	# Identificador unico del pedido.
	id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		primary_key=True,
		server_default=sa.text("gen_random_uuid()"),
	)
	# Numero de orden unico del pedido.
	numero_orden: Mapped[str] = mapped_column(
		sa.String,
		unique=True,
		nullable=False,
	)
	# Identificador del cliente (sin FK, pertenece a otro servicio).
	cliente_id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		nullable=False,
	)
	# Nombre del cliente en snapshot desnormalizado.
	cliente_nombre: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Email del cliente en snapshot desnormalizado.
	cliente_email: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Telefono del cliente en snapshot desnormalizado.
	cliente_telefono: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Identificador de la tienda (sin FK, pertenece a otro servicio).
	tienda_id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		nullable=False,
	)
	# Nombre de la tienda en snapshot desnormalizado.
	tienda_nombre: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Plataforma de origen del pedido.
	# CHECK: WEB, MOVIL, TIENDA_FISICA
	plataforma: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Tipo de entrega seleccionado.
	# CHECK: DOMICILIO, RECOGIDA, RETIRO_TIENDA
	entrega: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Estado actual del pedido.
	# CHECK: BORRADOR, EN_PROCESO, ENVIADO, ENTREGADO, CANCELADO,
	# COMPLETADO, REEMBOLSADO, FALLIDO
	estado: Mapped[str] = mapped_column(
		sa.String,
		nullable=False,
		server_default=sa.text("'BORRADOR'"),
	)
	# Subtotal del pedido (>= 0).
	subtotal: Mapped[sa.Numeric] = mapped_column(sa.Numeric, nullable=False)
	# Impuestos del pedido (>= 0).
	impuestos: Mapped[sa.Numeric] = mapped_column(sa.Numeric, nullable=False)
	# Costo de servicio del pedido (>= 0).
	servicio: Mapped[sa.Numeric] = mapped_column(sa.Numeric, nullable=False)
	# Descuento aplicado al pedido (>= 0).
	descuento: Mapped[sa.Numeric] = mapped_column(
		sa.Numeric,
		nullable=False,
		server_default=sa.text("0"),
	)
	# Total del pedido (>= 0).
	total: Mapped[sa.Numeric] = mapped_column(sa.Numeric, nullable=False)
	# Fecha de creacion del pedido.
	creado_en: Mapped[dt.datetime] = mapped_column(
		sa.DateTime(timezone=True),
		nullable=False,
		server_default=sa.text("now()"),
	)

	# Relacion con items del pedido.
	items: Mapped[list["ItemPedido"]] = relationship(
		"ItemPedido",
		back_populates="pedido",
		cascade="all, delete-orphan",
		passive_deletes=True,
	)
	# Relacion con historial de estados.
	historial_estados: Mapped[list["HistorialEstadoPedido"]] = relationship(
		"HistorialEstadoPedido",
		back_populates="pedido",
		cascade="all, delete-orphan",
		passive_deletes=True,
	)
	# Relacion con direcciones de servicio.
	direcciones_servicio: Mapped[list["DireccionServicio"]] = relationship(
		"DireccionServicio",
		back_populates="pedido",
		cascade="all, delete-orphan",
		passive_deletes=True,
	)


# Tabla de items asociados a un pedido.
class ItemPedido(Base):
	__tablename__ = "items_pedido"
	__table_args__ = (
		sa.Index("ix_items_pedido_pedido_id", "pedido_id"),
		{"comment": "Items de pedido"},
	)

	# Identificador unico del item.
	id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		primary_key=True,
		server_default=sa.text("gen_random_uuid()"),
	)
	# Referencia al pedido padre.
	pedido_id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		sa.ForeignKey("pedidos.id", ondelete="CASCADE"),
		nullable=False,
	)
	# Identificador del producto (sin FK, pertenece a otro servicio).
	producto_id: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Cantidad solicitada (> 0).
	cantidad: Mapped[int] = mapped_column(sa.Integer, nullable=False)
	# Precio unitario al momento de la compra.
	precio_unitario_snapshot: Mapped[sa.Numeric] = mapped_column(
		sa.Numeric,
		nullable=False,
	)
	# Total del item.
	total_item: Mapped[sa.Numeric] = mapped_column(sa.Numeric, nullable=False)
	# Nombre del producto en snapshot.
	nombre_producto_snapshot: Mapped[str] = mapped_column(
		sa.String,
		nullable=False,
		server_default=sa.text("''"),
	)
	# SKU del producto en snapshot.
	sku_producto_snapshot: Mapped[str] = mapped_column(
		sa.String,
		nullable=False,
		server_default=sa.text("''"),
	)
	# Subtotal del item en snapshot.
	subtotal_snapshot: Mapped[sa.Numeric] = mapped_column(
		sa.Numeric,
		nullable=False,
		server_default=sa.text("0"),
	)
	# Impuesto calculado para el item.
	impuesto_item: Mapped[sa.Numeric] = mapped_column(
		sa.Numeric,
		nullable=False,
		server_default=sa.text("0"),
	)
	# Descuento aplicado al item.
	descuento_item: Mapped[sa.Numeric] = mapped_column(
		sa.Numeric,
		nullable=False,
		server_default=sa.text("0"),
	)
	# Variantes seleccionadas del item.
	variantes_json: Mapped[dict] = mapped_column(
		JSONB,
		nullable=False,
		server_default=sa.text("'{}'::jsonb"),
	)
	# Notas adicionales del item.
	notas: Mapped[str] = mapped_column(
		sa.Text,
		nullable=False,
		server_default=sa.text("''"),
	)
	# Fecha de creacion del item.
	creado_en: Mapped[dt.datetime] = mapped_column(
		sa.DateTime(timezone=True),
		nullable=False,
		server_default=sa.text("now()"),
	)

	# Relacion con pedido.
	pedido: Mapped["Pedido"] = relationship(
		"Pedido",
		back_populates="items",
	)
	# Relacion con opciones seleccionadas del item.
	opciones_seleccionadas: Mapped[list["OpcionSeleccionadaItemPedido"]] = relationship(
		"OpcionSeleccionadaItemPedido",
		back_populates="item_pedido",
		cascade="all, delete-orphan",
		passive_deletes=True,
	)


# Tabla de historial de cambios de estado de un pedido.
class HistorialEstadoPedido(Base):
	__tablename__ = "historial_estados_pedido"
	__table_args__ = ({"comment": "Historial de estados del pedido"},)

	# Identificador unico del historial.
	id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		primary_key=True,
		server_default=sa.text("gen_random_uuid()"),
	)
	# Referencia al pedido.
	pedido_id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		sa.ForeignKey("pedidos.id", ondelete="CASCADE"),
		nullable=False,
	)
	# Estado anterior del pedido.
	estado_anterior: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Estado nuevo del pedido.
	estado_nuevo: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Usuario o sistema que realiza el cambio.
	cambiado_por: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Razon del cambio de estado.
	razon: Mapped[str] = mapped_column(
		sa.Text,
		nullable=False,
		server_default=sa.text("''"),
	)
	# Fecha del cambio de estado.
	cambiado_en: Mapped[dt.datetime] = mapped_column(
		sa.DateTime(timezone=True),
		nullable=False,
		server_default=sa.text("now()"),
	)

	# Relacion con pedido.
	pedido: Mapped["Pedido"] = relationship(
		"Pedido",
		back_populates="historial_estados",
	)


# Tabla de opciones seleccionadas por item.
class OpcionSeleccionadaItemPedido(Base):
	__tablename__ = "opciones_seleccionadas_item_pedido"
	__table_args__ = ({"comment": "Opciones seleccionadas en item"},)

	# Identificador unico de la opcion seleccionada.
	id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		primary_key=True,
		server_default=sa.text("gen_random_uuid()"),
	)
	# Referencia al item del pedido.
	item_pedido_id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		sa.ForeignKey("items_pedido.id", ondelete="CASCADE"),
		nullable=False,
	)
	# Identificador de opcion (sin FK, pertenece a otro servicio).
	opcion_id: Mapped[str] = mapped_column(
		sa.String,
		nullable=False,
		server_default=sa.text("''"),
	)
	# Tipo de opcion en snapshot.
	tipo_opcion_snapshot: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Codigo de opcion en snapshot.
	codigo_opcion_snapshot: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Etiqueta de opcion en snapshot.
	etiqueta_opcion_snapshot: Mapped[str] = mapped_column(sa.String, nullable=False)

	# Relacion con item del pedido.
	item_pedido: Mapped["ItemPedido"] = relationship(
		"ItemPedido",
		back_populates="opciones_seleccionadas",
	)


# Tabla de direcciones asociadas al servicio del pedido.
class DireccionServicio(Base):
	__tablename__ = "direcciones_servicio"
	__table_args__ = ({"comment": "Direcciones de servicio"},)

	# Identificador unico de la direccion.
	id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		primary_key=True,
		server_default=sa.text("gen_random_uuid()"),
	)
	# Referencia al pedido.
	pedido_id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		sa.ForeignKey("pedidos.id", ondelete="CASCADE"),
		nullable=False,
	)
	# Tipo de direccion (por ejemplo, envio o facturacion).
	tipo: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Numero principal de la direccion.
	numero1: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Numero secundario de la direccion (puede ser nulo).
	numero2: Mapped[str | None] = mapped_column(sa.String, nullable=True)
	# Calle de la direccion.
	calle: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Ciudad de la direccion.
	ciudad: Mapped[str] = mapped_column(sa.String, nullable=False)

	# Relacion con pedido.
	pedido: Mapped["Pedido"] = relationship(
		"Pedido",
		back_populates="direcciones_servicio",
	)
