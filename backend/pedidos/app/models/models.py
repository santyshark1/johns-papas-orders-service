import enum
import uuid
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.database import Base


class EstadoPedido(str, enum.Enum):
    BORRADOR = "BORRADOR"
    EN_PROCESO = "EN_PROCESO"
    ENVIADO = "ENVIADO"
    ENTREGADO = "ENTREGADO"
    CANCELADO = "CANCELADO"
    COMPLETADO = "COMPLETADO"
    REEMBOLSADO = "REEMBOLSADO"
    FALLIDO = "FALLIDO"


class PlataformaPedido(str, enum.Enum):
    WEB = "WEB"
    MOVIL = "MOVIL"
    TIENDA_FISICA = "TIENDA_FISICA"


class EntregaPedido(str, enum.Enum):
    DOMICILIO = "DOMICILIO"
    RECOGIDA = "RECOGIDA"
    RETIRO_TIENDA = "RETIRO_TIENDA"


class TipoDireccion(str, enum.Enum):
    DOMICILIO = "DOMICILIO"
    FACTURACION = "FACTURACION"


class Pedido(Base):
    __tablename__ = "pedidos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    numero_orden: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)

    cliente_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    cliente_nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    cliente_email: Mapped[str] = mapped_column(String(255), nullable=False)
    cliente_telefono: Mapped[str] = mapped_column(String(10), nullable=False)

    tienda_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    tienda_nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    plataforma: Mapped[str] = mapped_column(String(20), nullable=False)
    entrega: Mapped[str] = mapped_column(String(20), nullable=False)
    moneda: Mapped[str] = mapped_column(String(10), nullable=False, default="COP")

    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    impuestos: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    servicio: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    descuento: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    codigo_descuento: Mapped[str | None] = mapped_column(String(50), nullable=True)
    tiempo_servicio: Mapped[timedelta | None] = mapped_column(nullable=True)

    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
    completado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    direcciones: Mapped[list["DireccionServicio"]] = relationship(
        back_populates="pedido", cascade="all, delete-orphan"
    )
    items: Mapped[list["ItemPedido"]] = relationship(back_populates="pedido", cascade="all, delete-orphan")
    historial_estados: Mapped[list["HistorialEstadoPedido"]] = relationship(
        back_populates="pedido", cascade="all, delete-orphan"
    )

    __table_args__ = (
        CheckConstraint("subtotal >= 0", name="ck_pedido_subtotal_non_negative"),
        CheckConstraint("impuestos >= 0", name="ck_pedido_impuestos_non_negative"),
        CheckConstraint("servicio >= 0", name="ck_pedido_servicio_non_negative"),
        CheckConstraint("descuento >= 0", name="ck_pedido_descuento_non_negative"),
        CheckConstraint("total >= 0", name="ck_pedido_total_non_negative"),
        Index("ix_pedidos_cliente_id", "cliente_id"),
        Index("ix_pedidos_tienda_id", "tienda_id"),
    )


class DireccionServicio(Base):
    __tablename__ = "direcciones_servicio"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pedido_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pedidos.id", ondelete="CASCADE"),
        nullable=False,
    )
    tipo: Mapped[str] = mapped_column(String(20), nullable=False)
    numero1: Mapped[str] = mapped_column(String(255), nullable=False)
    numero2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    calle: Mapped[str] = mapped_column(String(255), nullable=False)
    ciudad: Mapped[str] = mapped_column(String(255), nullable=False)

    pedido: Mapped[Pedido] = relationship(back_populates="direcciones")

    __table_args__ = (
        UniqueConstraint("pedido_id", "tipo", name="unique_pedido_tipo"),
    )


class ItemPedido(Base):
    __tablename__ = "items_pedido"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pedido_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pedidos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    producto_id: Mapped[str] = mapped_column(String(50), nullable=False)
    nombre_producto_snapshot: Mapped[str] = mapped_column(String(200), nullable=False)
    sku_producto_snapshot: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    precio_unitario_snapshot: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    cantidad: Mapped[int] = mapped_column(nullable=False)
    subtotal_snapshot: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    impuesto_item: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    descuento_item: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    total_item: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    variantes_json: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    notas: Mapped[str] = mapped_column(Text, nullable=False, default="")
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    pedido: Mapped[Pedido] = relationship(back_populates="items")
    opciones_seleccionadas: Mapped[list["OpcionSeleccionadaItemPedido"]] = relationship(
        back_populates="item_pedido",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint("precio_unitario_snapshot >= 0", name="ck_item_precio_non_negative"),
        CheckConstraint("cantidad >= 1", name="ck_item_cantidad_positive"),
        CheckConstraint("subtotal_snapshot >= 0", name="ck_item_subtotal_non_negative"),
        CheckConstraint("impuesto_item >= 0", name="ck_item_impuesto_non_negative"),
        CheckConstraint("descuento_item >= 0", name="ck_item_descuento_non_negative"),
        CheckConstraint("total_item >= 0", name="ck_item_total_non_negative"),
    )


class OpcionSeleccionadaItemPedido(Base):
    __tablename__ = "opciones_seleccionadas_item_pedido"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_pedido_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("items_pedido.id", ondelete="CASCADE"),
        nullable=False,
    )

    opcion_id: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    tipo_opcion_snapshot: Mapped[str] = mapped_column(String(50), nullable=False)
    codigo_opcion_snapshot: Mapped[str] = mapped_column(String(50), nullable=False)
    etiqueta_opcion_snapshot: Mapped[str] = mapped_column(String(100), nullable=False)

    item_pedido: Mapped[ItemPedido] = relationship(back_populates="opciones_seleccionadas")


class HistorialEstadoPedido(Base):
    __tablename__ = "historial_estados_pedido"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pedido_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pedidos.id", ondelete="CASCADE"),
        nullable=False,
    )

    estado_anterior: Mapped[str] = mapped_column(String(20), nullable=False)
    estado_nuevo: Mapped[str] = mapped_column(String(20), nullable=False)
    cambiado_por: Mapped[str] = mapped_column(String(50), nullable=False)
    razon: Mapped[str] = mapped_column(Text, nullable=False, default="")
    cambiado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    pedido: Mapped[Pedido] = relationship(back_populates="historial_estados")

    __table_args__ = (
        Index("ix_historial_pedido_cambiado_en", "pedido_id", "cambiado_en"),
    )
