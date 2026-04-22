from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.models.models import EntregaPedido, EstadoPedido, PlataformaPedido, TipoDireccion


PRECISION = Decimal("0.01")


def q2(value: Decimal) -> Decimal:
    return value.quantize(PRECISION)


class OpcionSeleccionadaItemBase(BaseModel):
    opcion_id: str = ""
    tipo_opcion_snapshot: str = Field(..., min_length=1, max_length=50)
    codigo_opcion_snapshot: str = Field(..., min_length=1, max_length=50)
    etiqueta_opcion_snapshot: str = Field(..., min_length=1, max_length=100)


class OpcionSeleccionadaItemCreate(OpcionSeleccionadaItemBase):
    pass


class OpcionSeleccionadaItemRead(OpcionSeleccionadaItemBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


class ItemPedidoBase(BaseModel):
    producto_id: str = Field(..., min_length=1, max_length=50)
    nombre_producto_snapshot: str = Field(..., min_length=1, max_length=200)
    sku_producto_snapshot: str = ""
    precio_unitario_snapshot: Decimal = Field(..., ge=0)
    cantidad: int = Field(..., ge=1)
    subtotal_snapshot: Decimal = Field(..., ge=0)
    impuesto_item: Decimal = Field(default=Decimal("0.00"), ge=0)
    descuento_item: Decimal = Field(default=Decimal("0.00"), ge=0)
    total_item: Decimal = Field(..., ge=0)
    variantes_json: dict[str, Any] = Field(default_factory=dict)
    notas: str = ""
    opciones_seleccionadas: list[OpcionSeleccionadaItemCreate] = Field(default_factory=list)

    @model_validator(mode="after")
    def validar_calculos_item(self) -> "ItemPedidoBase":
        subtotal_esperado = q2(self.precio_unitario_snapshot * Decimal(self.cantidad))
        if q2(self.subtotal_snapshot) != subtotal_esperado:
            raise ValueError(
                f"El subtotal_snapshot debe ser {subtotal_esperado} (precio_unitario_snapshot x cantidad)."
            )

        total_esperado = q2(self.subtotal_snapshot + self.impuesto_item - self.descuento_item)
        if q2(self.total_item) != total_esperado:
            raise ValueError(
                f"El total_item debe ser {total_esperado} (subtotal_snapshot + impuesto_item - descuento_item)."
            )
        return self


class ItemPedidoCreate(ItemPedidoBase):
    pass


class ItemPedidoRead(ItemPedidoBase):
    id: UUID
    creado_en: datetime
    opciones_seleccionadas: list[OpcionSeleccionadaItemRead]

    model_config = ConfigDict(from_attributes=True)


class DireccionServicioBase(BaseModel):
    tipo: TipoDireccion
    numero1: str = Field(..., min_length=1, max_length=255)
    numero2: str | None = Field(default=None, max_length=255)
    calle: str = Field(..., min_length=1, max_length=255)
    ciudad: str = Field(..., min_length=1, max_length=255)


class DireccionServicioCreate(DireccionServicioBase):
    pass


class DireccionServicioRead(DireccionServicioBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


class PedidoBase(BaseModel):
    numero_orden: str = Field(..., min_length=1, max_length=20)
    cliente_id: UUID
    cliente_nombre: str = Field(..., min_length=1, max_length=255)
    cliente_email: EmailStr
    cliente_telefono: str = Field(..., min_length=7, max_length=10)

    tienda_id: UUID
    tienda_nombre: str = Field(..., min_length=1, max_length=255)
    plataforma: PlataformaPedido
    entrega: EntregaPedido
    moneda: str = Field(default="COP", min_length=1, max_length=10)

    subtotal: Decimal = Field(..., ge=0)
    impuestos: Decimal = Field(..., ge=0)
    servicio: Decimal = Field(..., ge=0)
    descuento: Decimal = Field(default=Decimal("0.00"), ge=0)
    total: Decimal = Field(..., ge=0)

    codigo_descuento: str | None = Field(default=None, max_length=50)
    tiempo_servicio: timedelta | None = None
    completado_en: datetime | None = None

    @field_validator("cliente_telefono")
    @classmethod
    def validar_telefono(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("cliente_telefono debe contener solo numeros.")
        return value

    @model_validator(mode="after")
    def validar_total_pedido(self) -> "PedidoBase":
        esperado = q2(self.subtotal + self.impuestos + self.servicio - self.descuento)
        if q2(self.total) != esperado:
            raise ValueError(f"El total debe ser {esperado} (subtotal + impuestos + servicio - descuento).")
        return self


class PedidoCreate(PedidoBase):
    direcciones: list[DireccionServicioCreate] = Field(default_factory=list)
    items: list[ItemPedidoCreate] = Field(default_factory=list)

    @model_validator(mode="after")
    def validar_tipos_direccion_unicos(self) -> "PedidoCreate":
        tipos = [direccion.tipo for direccion in self.direcciones]
        if len(tipos) != len(set(tipos)):
            raise ValueError("No se permiten direcciones duplicadas por tipo para el mismo pedido.")
        return self


class PedidoUpdate(PedidoCreate):
    estado: EstadoPedido = EstadoPedido.BORRADOR


class HistorialEstadoPedidoRead(BaseModel):
    id: UUID
    estado_anterior: EstadoPedido
    estado_nuevo: EstadoPedido
    cambiado_por: str
    razon: str
    cambiado_en: datetime

    model_config = ConfigDict(from_attributes=True)


class PedidoRead(PedidoBase):
    id: UUID
    estado: EstadoPedido
    creado_en: datetime
    actualizado_en: datetime
    direcciones: list[DireccionServicioRead]
    items: list[ItemPedidoRead]
    historial_estados: list[HistorialEstadoPedidoRead]

    model_config = ConfigDict(from_attributes=True)


class PedidoEstadoUpdate(BaseModel):
    estado_nuevo: EstadoPedido
    cambiado_por: str = Field(..., min_length=1, max_length=50)
    razon: str = ""


class MessageResponse(BaseModel):
    message: str
