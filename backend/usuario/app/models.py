from __future__ import annotations

import datetime as dt
import uuid

import sqlalchemy as sa
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
	"""Base declarativa para los modelos."""


# Tabla de usuarios del sistema.
class Usuario(Base):
	__tablename__ = "usuarios"
	__table_args__ = (
		sa.Index("ix_usuarios_email", "email"),
		{"comment": "Tabla de usuarios"},
	)

	# Identificador unico del usuario.
	id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		primary_key=True,
		server_default=sa.text("gen_random_uuid()"),
	)
	# Nombre visible del usuario.
	nombre: Mapped[str | None] = mapped_column(sa.String, nullable=True)
	# Correo electronico unico del usuario.
	email: Mapped[str | None] = mapped_column(
		sa.String,
		nullable=True,
		unique=True,
	)
	# Hash de la contrasena del usuario.
	password_hash: Mapped[str | None] = mapped_column(sa.Text, nullable=True)

	# Relacion N:M con roles a traves de usuario_roles.
	roles: Mapped[list["Rol"]] = relationship(
		"Rol",
		secondary="usuario_roles",
		back_populates="usuarios",
	)


# Tabla de roles disponibles para usuarios.
class Rol(Base):
	__tablename__ = "roles"
	__table_args__ = (
		sa.Index("ix_roles_nombre", "nombre"),
		{"comment": "Tabla de roles"},
	)

	# Identificador unico del rol.
	id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		primary_key=True,
		server_default=sa.text("gen_random_uuid()"),
	)
	# Nombre unico del rol.
	nombre: Mapped[str | None] = mapped_column(
		sa.String,
		nullable=True,
		unique=True,
	)

	# Relacion N:M con usuarios a traves de usuario_roles.
	usuarios: Mapped[list["Usuario"]] = relationship(
		"Usuario",
		secondary="usuario_roles",
		back_populates="roles",
	)
	# Relacion N:M con permisos a traves de rol_permisos.
	permisos: Mapped[list["Permiso"]] = relationship(
		"Permiso",
		secondary="rol_permisos",
		back_populates="roles",
	)


# Tabla de permisos disponibles en el sistema.
class Permiso(Base):
	__tablename__ = "permisos"
	__table_args__ = (
		sa.Index("ix_permisos_codigo", "codigo"),
		{"comment": "Tabla de permisos"},
	)

	# Identificador unico del permiso.
	id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		primary_key=True,
		server_default=sa.text("gen_random_uuid()"),
	)
	# Codigo unico del permiso.
	codigo: Mapped[str | None] = mapped_column(
		sa.String,
		nullable=True,
		unique=True,
	)

	# Relacion N:M con roles a traves de rol_permisos.
	roles: Mapped[list["Rol"]] = relationship(
		"Rol",
		secondary="rol_permisos",
		back_populates="permisos",
	)


# Tabla intermedia usuario_roles para relacion N:M entre usuarios y roles.
class UsuarioRol(Base):
	__tablename__ = "usuario_roles"
	__table_args__ = (
		sa.Index("ix_usuario_roles_usuario_id", "usuario_id"),
		sa.Index("ix_usuario_roles_rol_id", "rol_id"),
		sa.Index("ix_usuario_roles_tienda_id", "tienda_id"),
		{"comment": "Relacion N:M entre usuarios, roles y tiendas"},
	)

	# Referencia al usuario.
	usuario_id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		sa.ForeignKey("usuarios.id"),
		primary_key=True,
	)
	# Referencia al rol.
	rol_id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		sa.ForeignKey("roles.id"),
		primary_key=True,
	)
	# Identificador de la tienda (sin FK).
	tienda_id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		primary_key=True,
	)


# Tabla intermedia rol_permisos para relacion N:M entre roles y permisos.
class RolPermiso(Base):
	__tablename__ = "rol_permisos"
	__table_args__ = (
		sa.Index("ix_rol_permisos_rol_id", "rol_id"),
		sa.Index("ix_rol_permisos_permiso_id", "permiso_id"),
		{"comment": "Relacion N:M entre roles y permisos"},
	)

	# Referencia al rol.
	rol_id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		sa.ForeignKey("roles.id"),
		primary_key=True,
	)
	# Referencia al permiso.
	permiso_id: Mapped[uuid.UUID] = mapped_column(
		sa.Uuid(as_uuid=True),
		sa.ForeignKey("permisos.id"),
		primary_key=True,
	)