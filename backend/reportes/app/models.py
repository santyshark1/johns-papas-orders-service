from __future__ import annotations

import datetime as dt
import uuid

import sqlalchemy as sa
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

 
class Base(DeclarativeBase):
	"""Base declarativa para los modelos."""


# Tabla de auditoria general (particionada en Supabase).
class Auditoria(Base):
	__tablename__ = "auditoria"
	__table_args__ = (
		sa.Index("ix_auditoria_usuario_id", "usuario_id"),
		sa.Index("ix_auditoria_accion", "accion"),
		sa.Index("ix_auditoria_creado_en", "creado_en"),
		{"comment": "Eventos de auditoria del sistema"},
	)

	# Identificador unico del evento.
	# Nota: en Supabase la PK es (id, creado_en) por particiones; aqui solo id.
	id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		primary_key=True,
		server_default=sa.text("gen_random_uuid()"),
	)
	# Usuario asociado al evento (puede ser nulo).
	usuario_id: Mapped[uuid.UUID | None] = mapped_column(
		sa.Uuid(as_uuid=True),
		nullable=True,
	)
	# Accion registrada.
	accion: Mapped[str | None] = mapped_column(sa.String, nullable=True)
	# Fecha de creacion del evento.
	creado_en: Mapped[dt.datetime] = mapped_column(
		sa.DateTime(timezone=True),
		nullable=False,
		server_default=sa.text("now()"),
	)


# Particion 2025 de auditoria (misma estructura que auditoria).
class Auditoria2025(Base):
	__tablename__ = "auditoria_2025"
	__table_args__ = (
		sa.Index("ix_auditoria_2025_usuario_id", "usuario_id"),
		sa.Index("ix_auditoria_2025_accion", "accion"),
		sa.Index("ix_auditoria_2025_creado_en", "creado_en"),
		{"comment": "Particion 2025 de auditoria"},
	)

	# Identificador unico del evento.
	# Nota: en Supabase la PK es (id, creado_en) por particiones; aqui solo id.
	id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		primary_key=True,
		server_default=sa.text("gen_random_uuid()"),
	)
	# Usuario asociado al evento (puede ser nulo).
	usuario_id: Mapped[uuid.UUID | None] = mapped_column(
		sa.Uuid(as_uuid=True),
		nullable=True,
	)
	# Accion registrada.
	accion: Mapped[str | None] = mapped_column(sa.String, nullable=True)
	# Fecha de creacion del evento.
	creado_en: Mapped[dt.datetime] = mapped_column(
		sa.DateTime(timezone=True),
		nullable=False,
		server_default=sa.text("now()"),
	)


# Hecho de ventas para reporteria.
class FactVenta(Base):
	__tablename__ = "fact_ventas"
	__table_args__ = (
		sa.Index("ix_fact_ventas_pedido_id", "pedido_id"),
		sa.Index("ix_fact_ventas_numero_orden", "numero_orden"),
		sa.Index("ix_fact_ventas_creado_en", "creado_en"),
		{"comment": "Hecho de ventas"},
	)

	# Identificador unico del registro.
	id: Mapped[int] = mapped_column(
		sa.BigInteger,
		primary_key=True,
		autoincrement=True,
	)
	# Pedido asociado (sin FK, viene de otro servicio).
	pedido_id: Mapped[uuid.UUID | None] = mapped_column(
		sa.Uuid(as_uuid=True),
		nullable=True,
	)
	# Numero de orden unico.
	numero_orden: Mapped[str | None] = mapped_column(
		sa.String,
		nullable=True,
		unique=True,
	)
	# Total del pedido.
	total: Mapped[sa.Numeric | None] = mapped_column(sa.Numeric, nullable=True)
	# Fecha de creacion del hecho.
	creado_en: Mapped[dt.datetime | None] = mapped_column(
		sa.DateTime(timezone=True),
		nullable=True,
	)


# Hecho de inventario para reporteria.
class FactInventario(Base):
	__tablename__ = "fact_inventario"
	__table_args__ = (
		sa.Index("ix_fact_inventario_ingrediente_id", "ingrediente_id"),
		sa.Index("ix_fact_inventario_tipo_movimiento", "tipo_movimiento"),
		sa.Index("ix_fact_inventario_creado_en", "creado_en"),
		sa.CheckConstraint(
			"tipo_movimiento IN ('ENTRADA', 'SALIDA', 'AJUSTE')",
			name="ck_fact_inventario_tipo_movimiento",
		),
		{"comment": "Hecho de inventario"},
	)

	# Identificador unico del registro.
	id: Mapped[int] = mapped_column(
		sa.BigInteger,
		primary_key=True,
		autoincrement=True,
	)
	# Ingrediente asociado (sin FK, viene de otro servicio).
	ingrediente_id: Mapped[uuid.UUID | None] = mapped_column(
		sa.Uuid(as_uuid=True),
		nullable=True,
	)
	# Tipo de movimiento: ENTRADA, SALIDA o AJUSTE.
	tipo_movimiento: Mapped[str | None] = mapped_column(
		sa.String,
		nullable=True,
	)
	# Cantidad del movimiento.
	cantidad: Mapped[sa.Numeric | None] = mapped_column(sa.Numeric, nullable=True)
	# Fecha de creacion del hecho.
	creado_en: Mapped[dt.datetime | None] = mapped_column(
		sa.DateTime(timezone=True),
		nullable=True,
	)
