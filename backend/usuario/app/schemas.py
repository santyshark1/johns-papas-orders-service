from __future__ import annotations

import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, ValidationInfo, field_validator


PASSWORD_REGEX = re.compile(r"^(?=.*[A-Z])(?=.*\d).+$")


# Esquema de entrada para registro de usuarios.
class UsuarioRegister(BaseModel):
	nombre: str = Field(min_length=2, max_length=100)
	email: EmailStr
	password: str = Field(min_length=8)
	confirm_password: str

	@field_validator("email", mode="before")
	@classmethod
	def normalize_email(cls, value: str) -> str:
		# Normaliza el correo a minusculas.
		return value.strip().lower()

	@field_validator("password")
	@classmethod
	def validate_password_strength(cls, value: str) -> str:
		# Requiere al menos una mayuscula y un numero.
		if not PASSWORD_REGEX.match(value):
			raise ValueError("La contrasena debe tener al menos una mayuscula y un numero")
		return value

	@field_validator("confirm_password")
	@classmethod
	def validate_confirm_password(cls, value: str, info: ValidationInfo) -> str:
		# Valida que la confirmacion coincida con la contrasena.
		password = info.data.get("password")
		if password is not None and value != password:
			raise ValueError("Las contrasenas no coinciden")
		return value

	model_config = {
		"json_schema_extra": {
			"examples": [
				{
					"nombre": "Juan Perez",
					"email": "juan@example.com",
					"password": "Password1",
					"confirm_password": "Password1",
				}
			]
		}
	}


# Esquema de entrada para login de usuarios.
class UsuarioLogin(BaseModel):
	email: EmailStr
	password: str

	@field_validator("email", mode="before")
	@classmethod
	def normalize_email(cls, value: str) -> str:
		# Normaliza el correo a minusculas.
		return value.strip().lower()

	model_config = {
		"json_schema_extra": {
			"examples": [{"email": "juan@example.com", "password": "Password1"}]
		}
	}


# Respuesta al autenticar correctamente.
class TokenResponse(BaseModel):
	access_token: str
	refresh_token: str
	token_type: str = "bearer"

	model_config = {
		"json_schema_extra": {
			"examples": [
				{
					"access_token": "access.jwt.token",
					"refresh_token": "refresh.jwt.token",
					"token_type": "bearer",
				}
			]
		}
	}


# Entrada para refrescar el token.
class RefreshTokenRequest(BaseModel):
	refresh_token: str

	model_config = {
		"json_schema_extra": {"examples": [{"refresh_token": "refresh.jwt.token"}]}
	}


# Respuesta con datos del usuario sin password.
class UsuarioResponse(BaseModel):
	id: UUID
	nombre: str | None
	email: str | None
	roles: list[str]

	model_config = {
		"json_schema_extra": {
			"examples": [
				{
					"id": "8e0a3f2a-7c6e-4b67-9db5-4d5a55b02c12",
					"nombre": "Juan Perez",
					"email": "juan@example.com",
					"roles": ["admin", "cajero"],
				}
			]
		}
	}


# Esquema interno para crear usuarios en BD.
class UsuarioCreate(BaseModel):
	nombre: str | None = None
	email: EmailStr
	password_hash: str

	@field_validator("email", mode="before")
	@classmethod
	def normalize_email(cls, value: str) -> str:
		# Normaliza el correo a minusculas.
		return value.strip().lower()

	model_config = {
		"json_schema_extra": {
			"examples": [
				{
					"nombre": "Juan Perez",
					"email": "juan@example.com",
					"password_hash": "hashed-password",
				}
			]
		}
	}


# Esquema para crear roles.
class RoleCreate(BaseModel):
	nombre: str

	model_config = {"json_schema_extra": {"examples": [{"nombre": "admin"}]}}


# Respuesta de rol con permisos.
class RoleResponse(BaseModel):
	id: UUID
	nombre: str
	permisos: list[str] | None = None

	model_config = {
		"json_schema_extra": {
			"examples": [
				{
					"id": "f2e2f2ae-1fb0-4d1c-bc5a-cd86b70f2c30",
					"nombre": "admin",
					"permisos": ["usuarios:crear", "usuarios:ver"],
				}
			]
		}
	}


# Esquema para crear permisos.
class PermisoCreate(BaseModel):
	codigo: str

	model_config = {"json_schema_extra": {"examples": [{"codigo": "usuarios:ver"}]}}


# Respuesta de permiso.
class PermisoResponse(BaseModel):
	id: UUID
	codigo: str

	model_config = {
		"json_schema_extra": {
			"examples": [
				{
					"id": "c8d3e0ad-00e8-4a0b-9d8d-1a9a3d1f4a2e",
					"codigo": "usuarios:ver",
				}
			]
		}
	}


# Esquema para asignar un rol a un usuario.
class AssignRoleRequest(BaseModel):
	usuario_id: UUID
	rol_id: UUID
	tienda_id: UUID

	model_config = {
		"json_schema_extra": {
			"examples": [
				{
					"usuario_id": "8e0a3f2a-7c6e-4b67-9db5-4d5a55b02c12",
					"rol_id": "f2e2f2ae-1fb0-4d1c-bc5a-cd86b70f2c30",
					"tienda_id": "a8c9d4c4-1e5d-4e0f-8cf4-ff0d7c6b3b2a",
				}
			]
		}
	}


# Respuesta generica con mensaje.
class MessageResponse(BaseModel):
	message: str
	success: bool = True

	model_config = {
		"json_schema_extra": {"examples": [{"message": "Operacion exitosa", "success": True}]}
	}


# Respuesta para errores controlados.
class ErrorResponse(BaseModel):
	detail: str
	error_code: str | None = None

	model_config = {
		"json_schema_extra": {
			"examples": [
				{"detail": "Credenciales invalidas", "error_code": "AUTH_INVALID"}
			]
		}
	}