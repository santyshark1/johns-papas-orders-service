from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

 
# Respuesta de una venta individual.
class VentaReportResponse(BaseModel):
	# Identificador del pedido (externo).
	pedido_id: UUID | None
	# Numero de orden asociado.
	numero_orden: str | None
	# Total de la venta.
	total: float | None
	# Fecha de creacion de la venta.
	creado_en: datetime | None

	model_config = ConfigDict(
		from_attributes=True,
		json_schema_extra={
			"examples": [
				{
					"pedido_id": "b0f9e9d8-2a2c-4e65-a3a3-2d5d1f82615a",
					"numero_orden": "ORD-2024-0001",
					"total": 45.5,
					"creado_en": "2024-01-10T14:30:00Z",
				}
			]
		},
	)


# Resumen de ventas por periodo.
class VentaResumenResponse(BaseModel):
	# Cantidad total de pedidos en el periodo.
	total_ventas: int = Field(..., ge=0)
	# Suma total de ingresos en el periodo.
	ingresos_totales: float = Field(..., ge=0)
	# Promedio de venta por pedido.
	promedio_venta: float = Field(..., ge=0)
	# Fecha inicial del periodo.
	fecha_desde: datetime
	# Fecha final del periodo.
	fecha_hasta: datetime

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{
					"total_ventas": 120,
					"ingresos_totales": 3520.75,
					"promedio_venta": 29.34,
					"fecha_desde": "2024-01-01T00:00:00Z",
					"fecha_hasta": "2024-01-31T23:59:59Z",
				}
			]
		}
	)


# Respuesta de movimiento de inventario para reportes.
class InventarioMovimientoResponse(BaseModel):
	# Identificador del ingrediente (externo).
	ingrediente_id: UUID | None
	# Tipo de movimiento registrado.
	tipo_movimiento: str | None
	# Cantidad del movimiento.
	cantidad: float | None
	# Fecha de creacion del movimiento.
	creado_en: datetime | None
	# Nombre del ingrediente (respuesta enriquecida).
	ingrediente_nombre: str | None = None

	model_config = ConfigDict(
		from_attributes=True,
		json_schema_extra={
			"examples": [
				{
					"ingrediente_id": "b0f9e9d8-2a2c-4e65-a3a3-2d5d1f82615a",
					"tipo_movimiento": "SALIDA",
					"cantidad": 5.0,
					"creado_en": "2024-01-10T14:30:00Z",
					"ingrediente_nombre": "Papas",
				}
			]
		},
	)


# Resumen de movimientos de inventario por tipo.
class InventarioResumenResponse(BaseModel):
	# Tipo de movimiento resumido.
	tipo_movimiento: str
	# Total acumulado de cantidades.
	total_cantidad: float = Field(..., ge=0)
	# Cantidad de registros incluidos.
	cantidad_registros: int = Field(..., ge=0)

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{
					"tipo_movimiento": "ENTRADA",
					"total_cantidad": 120.5,
					"cantidad_registros": 8,
				}
			]
		}
	)


# Respuesta de auditoria.
class AuditoriaResponse(BaseModel):
	# Identificador del evento.
	id: UUID
	# Usuario asociado al evento (externo).
	usuario_id: UUID | None
	# Accion registrada.
	accion: str | None
	# Fecha de creacion del evento.
	creado_en: datetime

	model_config = ConfigDict(
		from_attributes=True,
		json_schema_extra={
			"examples": [
				{
					"id": "9a4d6760-7c6a-4e0e-8c74-5b9f281f6e02",
					"usuario_id": "b0f9e9d8-2a2c-4e65-a3a3-2d5d1f82615a",
					"accion": "LOGIN",
					"creado_en": "2024-01-10T14:30:00Z",
				}
			]
		},
	)


# Filtros de consulta para auditoria.
class FiltrosAuditoria(BaseModel):
	# Usuario asociado al evento.
	usuario_id: UUID | None = None
	# Accion registrada.
	accion: str | None = None
	# Fecha inicial del filtro.
	fecha_desde: datetime | None = None
	# Fecha final del filtro.
	fecha_hasta: datetime | None = None

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{
					"usuario_id": "b0f9e9d8-2a2c-4e65-a3a3-2d5d1f82615a",
					"accion": "LOGIN",
					"fecha_desde": "2024-01-01T00:00:00Z",
					"fecha_hasta": "2024-01-31T23:59:59Z",
				}
			]
		},
	)


# Filtros de consulta para ventas.
class FiltrosVentas(BaseModel):
	# Fecha inicial del filtro.
	fecha_desde: datetime | None = None
	# Fecha final del filtro.
	fecha_hasta: datetime | None = None

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{
					"fecha_desde": "2024-01-01T00:00:00Z",
					"fecha_hasta": "2024-01-31T23:59:59Z",
				}
			]
		}
	)


# Filtros de consulta para inventario.
class FiltrosInventario(BaseModel):
	# Ingrediente a filtrar (externo).
	ingrediente_id: UUID | None = None
	# Tipo de movimiento a filtrar.
	tipo_movimiento: str | None = None
	# Fecha inicial del filtro.
	fecha_desde: datetime | None = None
	# Fecha final del filtro.
	fecha_hasta: datetime | None = None

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [
				{
					"ingrediente_id": "b0f9e9d8-2a2c-4e65-a3a3-2d5d1f82615a",
					"tipo_movimiento": "SALIDA",
					"fecha_desde": "2024-01-01T00:00:00Z",
					"fecha_hasta": "2024-01-31T23:59:59Z",
				}
			]
		},
	)


# Respuesta generica con mensaje.
class MessageResponse(BaseModel):
	# Mensaje descriptivo.
	message: str
	# Resultado de la operacion.
	success: bool

	model_config = ConfigDict(
		json_schema_extra={
			"examples": [{"message": "Operacion exitosa", "success": True}]
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
				{"detail": "Error en la consulta", "error_code": "REPORTES_ERROR"}
			]
		}
	)
