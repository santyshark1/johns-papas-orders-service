from __future__ import annotations

import datetime as dt
import uuid

import sqlalchemy as sa
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
	"""Base declarativa para los modelos."""


# Tabla principal de ingredientes.
class Ingrediente(Base):
	__tablename__ = "ingredientes"
	__table_args__ = (
		sa.Index("ix_ingredientes_nombre", "nombre"),
		{"comment": "Tabla de ingredientes"},
	)

	# Identificador unico del ingrediente.
	id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		primary_key=True,
		server_default=sa.text("gen_random_uuid()"),
	)
	# Nombre del ingrediente.
	nombre: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Stock actual disponible del ingrediente.
	stock_actual: Mapped[sa.Numeric] = mapped_column(
		sa.Numeric,
		nullable=False,
		server_default=sa.text("0"),
	)
	# Costo unitario del ingrediente.
	costo_unitario: Mapped[sa.Numeric] = mapped_column(
		sa.Numeric,
		nullable=False,
		server_default=sa.text("0"),
	)

	# Relacion con movimientos de inventario.
	movimientos: Mapped[list["MovimientoInventario"]] = relationship(
		"MovimientoInventario",
		back_populates="ingrediente",
	)


# Tabla de movimientos de inventario.
class MovimientoInventario(Base):
	__tablename__ = "movimientos_inventario"
	__table_args__ = (
		sa.Index("ix_movimientos_inventario_ingrediente_id", "ingrediente_id"),
		sa.Index("ix_movimientos_inventario_creado_en", "creado_en"),
		{"comment": "Movimientos del inventario"},
	)

	# Identificador unico del movimiento.
	id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		primary_key=True,
		server_default=sa.text("gen_random_uuid()"),
	)
	# Referencia al ingrediente asociado.
	ingrediente_id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		sa.ForeignKey("ingredientes.id", ondelete="RESTRICT"),
		nullable=False,
	)
	# Tipo de movimiento (ENTRADA, SALIDA, AJUSTE).
	tipo_movimiento: Mapped[str] = mapped_column(sa.String, nullable=False)
	# Cantidad del movimiento (puede ser nula para ajustes especiales).
	cantidad: Mapped[sa.Numeric | None] = mapped_column(sa.Numeric, nullable=True)
	# Fecha de creacion del movimiento.
	creado_en: Mapped[dt.datetime] = mapped_column(
		sa.DateTime(timezone=True),
		nullable=False,
		server_default=sa.text("now()"),
	)

	# Relacion con ingrediente.
	ingrediente: Mapped["Ingrediente"] = relationship(
		"Ingrediente",
		back_populates="movimientos",
	)
