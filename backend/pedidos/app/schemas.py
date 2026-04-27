from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class OpcionSeleccionadaCreate(BaseModel):
	"""Entrada para opciones seleccionadas de un item."""

	# Identificador de opcion en el catalogo externo.
	opcion_id: str
	# Tipo de opcion en snapshot.
	tipo_opcion_snapshot: str
	# Codigo de opcion en snapshot.
	codigo_opcion_snapshot: str
	# Etiqueta de opcion en snapshot.
	etiqueta_opcion_snapshot: str

	model_config = {
		"json_schema_extra": {
			"examples": [
				{
					"opcion_id": "extra_queso",
					"tipo_opcion_snapshot": "EXTRA",
					"codigo_opcion_snapshot": "QUESO",
					"etiqueta_opcion_snapshot": "Extra queso",
				}
			]
		}
	}


class ItemPedidoCreate(BaseModel):
	"""Entrada para crear un item de pedido."""

	# Identificador del producto externo.
	producto_id: str
	# Cantidad solicitada del producto.
	cantidad: int = Field(..., ge=1)
	# Precio unitario capturado en el momento de la compra.
	precio_unitario_snapshot: float = Field(..., ge=0)
	# Nombre del producto en snapshot.
	nombre_producto_snapshot: str
	# SKU del producto en snapshot.
	sku_producto_snapshot: str | None = None
	# Impuesto calculado para el item.
	impuesto_item: float = Field(0, ge=0)
	# Descuento aplicado al item.
	descuento_item: float = Field(0, ge=0)
	# Variantes seleccionadas del item.
	variantes_json: dict = Field(default_factory=dict)
	# Notas adicionales del item.
	notas: str | None = None
	# Opciones seleccionadas del item.
	opciones_seleccionadas: list[OpcionSeleccionadaCreate] | None = None

	@field_validator("cantidad")
	@classmethod
	def _validar_cantidad(cls, value: int) -> int:
		"""Valida que la cantidad sea positiva."""
		if value <= 0:
			raise ValueError("La cantidad debe ser mayor que 0")
		return value

	model_config = {
		"json_schema_extra": {
			"examples": [
				{
					"producto_id": "PZ-001",
					"cantidad": 2,
					"precio_unitario_snapshot": 8.5,
					"nombre_producto_snapshot": "Pizza Margarita",
					"sku_producto_snapshot": "PZMARG",
					"impuesto_item": 0.75,
					"descuento_item": 0,
					"variantes_json": {"tamano": "grande"},
					"notas": "Sin cebolla",
					"opciones_seleccionadas": [
						{
							"opcion_id": "extra_queso",
							"tipo_opcion_snapshot": "EXTRA",
							"codigo_opcion_snapshot": "QUESO",
							"etiqueta_opcion_snapshot": "Extra queso",
						}
					],
				}
			]
		}
	}


class DireccionCreate(BaseModel):
	"""Entrada para direccion de servicio."""

	# Tipo de direccion (envio, facturacion, etc.).
	tipo: str
	# Numero principal de la direccion.
	numero1: str
	# Numero secundario de la direccion.
	numero2: str | None = None
	# Calle de la direccion.
	calle: str
	# Ciudad de la direccion.
	ciudad: str

	model_config = {
		"json_schema_extra": {
			"examples": [
				{
					"tipo": "ENVIO",
					"numero1": "123",
					"numero2": "A",
					"calle": "Calle Central",
					"ciudad": "Ciudad Test",
				}
			]
		}
	}


class PedidoCreate(BaseModel):
	"""Entrada para crear un pedido."""

	# Identificador del cliente (externo).
	cliente_id: UUID
	# Nombre del cliente en snapshot.
	cliente_nombre: str
	# Email del cliente en snapshot.
	cliente_email: EmailStr
	# Telefono del cliente en snapshot.
	cliente_telefono: str
	# Identificador de la tienda (externo).
	tienda_id: UUID
	# Nombre de la tienda en snapshot.
	tienda_nombre: str
	# Plataforma de origen del pedido.
	plataforma: Literal["WEB", "MOVIL", "TIENDA_FISICA"]
	# Tipo de entrega del pedido.
	entrega: Literal["DOMICILIO", "RECOGIDA", "RETIRO_TIENDA"]
	# Direccion requerida para entregas a domicilio.
	direccion: DireccionCreate | None = None
	# Items que componen el pedido.
	items: list[ItemPedidoCreate]

	model_config = {
		"json_schema_extra": {
			"examples": [
				{
					"cliente_id": "8f9b6c36-8f07-4cda-8a6a-0fd0376a3c87",
					"cliente_nombre": "Juan Perez",
					"cliente_email": "juan@example.com",
					"cliente_telefono": "+57 300 000 0000",
					"tienda_id": "e1b4d9f5-4d98-4b4e-8f77-9e71f6b4b0d2",
					"tienda_nombre": "Johns Papas",
					"plataforma": "WEB",
					"entrega": "DOMICILIO",
					"direccion": {
						"tipo": "ENVIO",
						"numero1": "123",
						"numero2": "A",
						"calle": "Calle Central",
						"ciudad": "Ciudad Test",
					},
					"items": [
						{
							"producto_id": "PZ-001",
							"cantidad": 2,
							"precio_unitario_snapshot": 8.5,
							"nombre_producto_snapshot": "Pizza Margarita",
							"sku_producto_snapshot": "PZMARG",
							"impuesto_item": 0.75,
							"descuento_item": 0,
							"variantes_json": {"tamano": "grande"},
							"notas": "Sin cebolla",
							"opciones_seleccionadas": [
								{
									"opcion_id": "extra_queso",
									"tipo_opcion_snapshot": "EXTRA",
									"codigo_opcion_snapshot": "QUESO",
									"etiqueta_opcion_snapshot": "Extra queso",
								}
							],
						}
					],
				}
			]
		}
	}


class OpcionSeleccionadaResponse(BaseModel):
	"""Respuesta con opcion seleccionada del item."""

	# Identificador interno de la opcion seleccionada.
	id: UUID
	# Identificador de opcion externa.
	opcion_id: str
	# Tipo de opcion en snapshot.
	tipo_opcion_snapshot: str
	# Codigo de opcion en snapshot.
	codigo_opcion_snapshot: str
	# Etiqueta de opcion en snapshot.
	etiqueta_opcion_snapshot: str

	model_config = ConfigDict(from_attributes=True)


class ItemPedidoResponse(BaseModel):
	"""Respuesta con detalle de item de pedido."""

	# Identificador interno del item.
	id: UUID
	# Identificador del producto externo.
	producto_id: str
	# Cantidad solicitada.
	cantidad: int
	# Precio unitario al momento de la compra.
	precio_unitario_snapshot: float
	# Total del item.
	total_item: float
	# Nombre del producto en snapshot.
	nombre_producto_snapshot: str
	# SKU del producto en snapshot.
	sku_producto_snapshot: str | None = None
	# Impuesto calculado para el item.
	impuesto_item: float
	# Descuento aplicado al item.
	descuento_item: float
	# Variantes seleccionadas del item.
	variantes_json: dict | None = None
	# Notas adicionales del item.
	notas: str | None = None
	# Opciones seleccionadas del item.
	opciones_seleccionadas: list[OpcionSeleccionadaResponse]

	model_config = ConfigDict(from_attributes=True)


class DireccionResponse(BaseModel):
	"""Respuesta con direccion de servicio."""

	# Identificador interno de la direccion.
	id: UUID
	# Tipo de direccion.
	tipo: str
	# Numero principal de la direccion.
	numero1: str
	# Numero secundario de la direccion.
	numero2: str | None
	# Calle de la direccion.
	calle: str
	# Ciudad de la direccion.
	ciudad: str

	model_config = ConfigDict(from_attributes=True)


class PedidoResponse(BaseModel):
	"""Respuesta con el pedido completo."""
 
	# Identificador interno del pedido.
	id: UUID
	# Numero de orden del pedido.
	numero_orden: str
	# Identificador del cliente.
	cliente_id: UUID
	# Nombre del cliente en snapshot.
	cliente_nombre: str
	# Email del cliente en snapshot.
	cliente_email: str
	# Identificador de la tienda.
	tienda_id: UUID
	# Nombre de la tienda en snapshot.
	tienda_nombre: str
	# Plataforma del pedido.
	plataforma: str
	# Tipo de entrega del pedido.
	entrega: str
	# Estado del pedido.
	estado: str
	# Subtotal del pedido.
	subtotal: float
	# Impuestos del pedido.
	impuestos: float
	# Costo de servicio del pedido.
	servicio: float
	# Descuento aplicado al pedido.
	descuento: float
	# Total del pedido.
	total: float
	# Fecha de creacion del pedido.
	creado_en: datetime
	# Items del pedido.
	items: list[ItemPedidoResponse]
	# Direcciones del pedido.
	direcciones: list[DireccionResponse] | None

	model_config = ConfigDict(from_attributes=True)


class EstadoHistoryResponse(BaseModel):
	"""Respuesta con historial de estados de un pedido."""

	# Identificador interno del historial.
	id: UUID
	# Estado anterior del pedido.
	estado_anterior: str
	# Estado nuevo del pedido.
	estado_nuevo: str
	# Usuario o sistema que realizo el cambio.
	cambiado_por: str
	# Razon del cambio.
	razon: str
	# Fecha del cambio.
	cambiado_en: datetime

	model_config = ConfigDict(
		from_attributes=True,
		json_schema_extra={
			"examples": [
				{
					"id": "b17f6b9c-8d8f-4f6b-9d2f-02a1b7e1e7d9",
					"estado_anterior": "BORRADOR",
					"estado_nuevo": "EN_PROCESO",
					"cambiado_por": "8f9b6c36-8f07-4cda-8a6a-0fd0376a3c87",
					"razon": "Pago confirmado",
					"cambiado_en": "2026-04-24T12:30:00Z",
				}
			]
		},
	)


class EstadoUpdateRequest(BaseModel):
	"""Entrada para cambiar el estado de un pedido."""

	# Estado nuevo del pedido.
	estado: str
	# Razon del cambio.
	razon: str

	model_config = {
		"json_schema_extra": {
			"examples": [
				{
					"estado": "EN_PROCESO",
					"razon": "Pago confirmado",
				}
			]
		}
	}


class MessageResponse(BaseModel):
	"""Respuesta generica de exito."""

	# Mensaje informativo.
	message: str
	# Indicador de exito.
	success: bool

	model_config = {
		"json_schema_extra": {
			"examples": [
				{
					"message": "Operacion exitosa",
					"success": True,
				}
			]
		}
	}


class ErrorResponse(BaseModel):
	"""Respuesta generica de error."""

	# Detalle del error.
	detail: str
	# Codigo opcional de error.
	error_code: str | None = None

	model_config = {
		"json_schema_extra": {
			"examples": [
				{
					"detail": "Pedido no encontrado",
					"error_code": "NOT_FOUND",
				}
			]
		}
	}
