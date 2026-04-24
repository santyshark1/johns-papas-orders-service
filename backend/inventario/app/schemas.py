from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


# Entrada para crear un ingrediente.
class IngredienteCreate(BaseModel):
	# Nombre del ingrediente.
	nombre: str = Field(..., min_length=1, max_length=100)
	# Stock inicial del ingrediente.
	stock_actual: float = Field(0, ge=0)
	# Costo unitario del ingrediente.
	costo_unitario: float = Field(0, ge=0)

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{
					"nombre": "Papas",
					"stock_actual": 25.5,
					"costo_unitario": 1.2,
				}
			]
		}
	)


# Entrada para actualizar stock o costo de un ingrediente.
class IngredienteUpdate(BaseModel):
	# Nuevo stock del ingrediente.
	stock_actual: float | None = Field(None, ge=0)
	# Nuevo costo unitario del ingrediente.
	costo_unitario: float | None = Field(None, ge=0)

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{
					"stock_actual": 40,
					"costo_unitario": 1.35,
				}
			]
		}
	)


# Respuesta con datos de ingrediente.
class IngredienteResponse(BaseModel):
	# Identificador del ingrediente.
	id: UUID
	# Nombre del ingrediente.
	nombre: str
	# Stock actual del ingrediente.
	stock_actual: float
	# Costo unitario del ingrediente.
	costo_unitario: float

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{
					"id": "b0f9e9d8-2a2c-4e65-a3a3-2d5d1f82615a",
					"nombre": "Papas",
					"stock_actual": 25.5,
					"costo_unitario": 1.2,
				}
			]
		}
	)


# Entrada para registrar un movimiento de inventario.
class MovimientoCreate(BaseModel):
	# Identificador del ingrediente.
	ingrediente_id: UUID
	# Tipo de movimiento permitido.
	tipo_movimiento: Literal["ENTRADA", "SALIDA", "AJUSTE"]
	# Cantidad del movimiento.
	cantidad: float = Field(...)

	@model_validator(mode="after")
	def validar_cantidad(self) -> "MovimientoCreate":
		if self.tipo_movimiento in {"ENTRADA", "SALIDA"} and self.cantidad <= 0:
			raise ValueError(
				"cantidad debe ser > 0 para movimientos de ENTRADA o SALIDA"
			)
		return self

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{
					"ingrediente_id": "b0f9e9d8-2a2c-4e65-a3a3-2d5d1f82615a",
					"tipo_movimiento": "ENTRADA",
					"cantidad": 12.5,
				}
			]
		}
	)


# Respuesta con datos de movimiento.
class MovimientoResponse(BaseModel):
	# Identificador del movimiento.
	id: UUID
	# Identificador del ingrediente.
	ingrediente_id: UUID
	# Tipo de movimiento registrado.
	tipo_movimiento: str
	# Cantidad registrada.
	cantidad: float | None
	# Fecha de creacion del movimiento.
	creado_en: datetime
	# Nombre del ingrediente (respuesta enriquecida).
	ingrediente_nombre: str | None = None

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{
					"id": "5c3c9e3b-9b77-45b9-92d1-3b9d2c9f7c4a",
					"ingrediente_id": "b0f9e9d8-2a2c-4e65-a3a3-2d5d1f82615a",
					"tipo_movimiento": "SALIDA",
					"cantidad": 3,
					"creado_en": "2024-01-10T14:30:00Z",
					"ingrediente_nombre": "Papas",
				}
			]
		}
	)


# Item individual para descuento de stock.
class DescontarItem(BaseModel):
	# Identificador del ingrediente.
	ingrediente_id: UUID
	# Cantidad solicitada para descuento.
	cantidad: int = Field(..., ge=1)

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{
					"ingrediente_id": "b0f9e9d8-2a2c-4e65-a3a3-2d5d1f82615a",
					"cantidad": 2,
				}
			]
		}
	)


# Solicitud para descontar stock desde pedidos.
class DescontarStockRequest(BaseModel):
	# Lista de items a descontar.
	items: list[DescontarItem]

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{
					"items": [
						{
							"ingrediente_id": "b0f9e9d8-2a2c-4e65-a3a3-2d5d1f82615a",
							"cantidad": 2,
						}
					]
				}
			]
		}
	)


# Detalle individual de descuento de stock.
class DescontarDetalle(BaseModel):
	# Identificador del ingrediente.
	ingrediente_id: UUID
	# Nombre del ingrediente.
	ingrediente_nombre: str
	# Cantidad solicitada.
	cantidad_solicitada: int
	# Stock actual disponible.
	stock_actual: float
	# Resultado del descuento.
	success: bool
	# Mensaje de detalle.
	mensaje: str

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{
					"ingrediente_id": "b0f9e9d8-2a2c-4e65-a3a3-2d5d1f82615a",
					"ingrediente_nombre": "Papas",
					"cantidad_solicitada": 2,
					"stock_actual": 10,
					"success": True,
					"mensaje": "Stock actualizado",
				}
			]
		}
	)


# Respuesta para descuentos de stock.
class DescontarStockResponse(BaseModel):
	# Resultado general de la operacion.
	success: bool
	# Mensaje general.
	mensaje: str
	# Detalles por ingrediente.
	detalles: list[DescontarDetalle] | None = None

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{
					"success": True,
					"mensaje": "Descuento procesado",
					"detalles": [
						{
							"ingrediente_id": "b0f9e9d8-2a2c-4e65-a3a3-2d5d1f82615a",
							"ingrediente_nombre": "Papas",
							"cantidad_solicitada": 2,
							"stock_actual": 10,
							"success": True,
							"mensaje": "Stock actualizado",
						}
					],
				}
			]
		}
	)


# Respuesta simple para mensajes.
class MessageResponse(BaseModel):
	# Mensaje descriptivo.
	message: str
	# Resultado de la operacion.
	success: bool

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{"message": "Operacion exitosa", "success": True}
			]
		}
	)


# Respuesta estandar para errores.
class ErrorResponse(BaseModel):
	# Detalle del error.
	detail: str
	# Codigo de error opcional.
	error_code: str | None = None

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{"detail": "Ingrediente no encontrado", "error_code": "NOT_FOUND"}
			]
		}
	)
