import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Ingrediente(Base):
    __tablename__ = "ingredientes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    stock_actual: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=0)
    costo_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=0)


class MovimientoInventario(Base):
    __tablename__ = "movimientos_inventario"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ingrediente_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ingredientes.id"))
    tipo_movimiento: Mapped[str] = mapped_column(String(30))
    cantidad: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)