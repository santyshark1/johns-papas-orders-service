from __future__ import annotations

import os
from typing import Any
from uuid import UUID

import httpx
from fastapi import HTTPException

USUARIO_SERVICE_URL = os.getenv("USUARIO_SERVICE_URL", "http://localhost:8000")
INVENTARIO_SERVICE_URL = os.getenv("INVENTARIO_SERVICE_URL", "http://localhost:8002")

TIMEOUT_SECONDS = 25.0
 

def _build_timeout() -> httpx.Timeout:
	"""Configura el timeout para llamadas HTTP."""
	return httpx.Timeout(TIMEOUT_SECONDS)


async def validar_cliente(cliente_id: UUID, token: str) -> bool:
	"""Valida si existe el cliente en el servicio de usuarios."""
	url = f"{USUARIO_SERVICE_URL}/usuarios/{cliente_id}"
	headers = {"Authorization": f"Bearer {token}"}
	try:
		async with httpx.AsyncClient(timeout=_build_timeout()) as client:
			response = await client.get(url, headers=headers)
			return response.status_code == 200
	except httpx.TimeoutException as exc:
		print(f"Timeout al validar cliente: {exc}")
		raise HTTPException(
			status_code=503,
			detail="Servicio de usuarios no disponible",
		) from exc
	except httpx.RequestError as exc:
		print(f"Error de red al validar cliente: {exc}")
		raise HTTPException(
			status_code=503,
			detail="Servicio de usuarios no disponible",
		) from exc


async def descontar_stock(items: list[dict[str, Any]]) -> bool:
	"""Solicita descuento de stock al servicio de inventario."""
	url = f"{INVENTARIO_SERVICE_URL}/inventario/descontar"
	payload = {"items": items}
	try:
		async with httpx.AsyncClient(timeout=_build_timeout()) as client:
			response = await client.post(url, json=payload)
			return response.status_code == 200
	except httpx.TimeoutException as exc:
		print(f"Timeout al descontar stock: {exc}")
		raise HTTPException(
			status_code=503,
			detail="Servicio de inventario no disponible",
		) from exc
	except httpx.RequestError as exc:
		print(f"Error de red al descontar stock: {exc}")
		raise HTTPException(
			status_code=503,
			detail="Servicio de inventario no disponible",
		) from exc
