docker run -d \
  --name postgres-local \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=pedidos \
  -p 5432:5432 \
  postgres:15

---------------script

-- ============================================================
-- JOHN'S PAPAS — BASE DE DATOS UNIFICADA
-- DB: johns_papas_db
-- ============================================================
-- Extensión correcta para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- [1] PEDIDOS
-- ============================================================

CREATE TABLE pedidos (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_orden     VARCHAR(20) NOT NULL UNIQUE,

    cliente_id       UUID        NOT NULL,
    cliente_nombre   VARCHAR(255) NOT NULL,
    cliente_email    VARCHAR(255) NOT NULL,
    cliente_telefono VARCHAR(10)  NOT NULL,

    tienda_id        UUID        NOT NULL,
    tienda_nombre    VARCHAR(255) NOT NULL,

    plataforma  VARCHAR(20) NOT NULL CHECK (plataforma IN ('WEB','MOVIL','TIENDA_FISICA')),
    entrega     VARCHAR(20) NOT NULL CHECK (entrega IN ('DOMICILIO','RECOGIDA','RETIRO_TIENDA')),
    estado      VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
                CHECK (estado IN ('BORRADOR','EN_PROCESO','ENVIADO','ENTREGADO',
                                  'CANCELADO','COMPLETADO','REEMBOLSADO','FALLIDO')),

    subtotal    NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    impuestos   NUMERIC(10,2) NOT NULL CHECK (impuestos >= 0),
    servicio    NUMERIC(10,2) NOT NULL CHECK (servicio >= 0),
    descuento   NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (descuento >= 0),
    total       NUMERIC(10,2) NOT NULL CHECK (total >= 0),

    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE items_pedido (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id   UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id VARCHAR(50) NOT NULL,
    cantidad    INT NOT NULL CHECK (cantidad > 0),
    precio_unit NUMERIC(10,2) NOT NULL,
    total       NUMERIC(10,2) NOT NULL
);

-- ============================================================
-- [2] INVENTARIO
-- ============================================================

CREATE TABLE ingredientes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre        VARCHAR(150) NOT NULL,
    stock_actual  NUMERIC(12,3) NOT NULL DEFAULT 0,
    costo_unitario NUMERIC(10,4) NOT NULL DEFAULT 0
);

CREATE TABLE movimientos_inventario (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingrediente_id  UUID NOT NULL REFERENCES ingredientes(id),
    tipo_movimiento VARCHAR(30) CHECK (tipo_movimiento IN ('ENTRADA','SALIDA','AJUSTE')),
    cantidad        NUMERIC(12,3),
    creado_en       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- [3] USUARIOS + ACCESOS
-- ============================================================

CREATE TABLE roles (
    id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE
);

CREATE TABLE usuarios (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre        VARCHAR(150),
    email         VARCHAR(255) UNIQUE,
    password_hash TEXT
);

CREATE TABLE usuario_roles (
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id     UUID REFERENCES roles(id),
    tienda_id  UUID,
    PRIMARY KEY (usuario_id, rol_id, tienda_id)
);

CREATE UNIQUE INDEX ux_usuario_roles
ON usuario_roles (
    usuario_id,
    rol_id,
    COALESCE(tienda_id, '00000000-0000-0000-0000-000000000000'::UUID)
);

-- Permisos
CREATE TABLE permisos (
    id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(100) UNIQUE
);

CREATE TABLE rol_permisos (
    rol_id     UUID,
    permiso_id UUID REFERENCES permisos(id),
    PRIMARY KEY (rol_id, permiso_id)
);

-- Auditoría (corregida para partición)
CREATE TABLE auditoria (
    id         UUID DEFAULT gen_random_uuid(),
    usuario_id UUID,
    accion     VARCHAR(100),
    creado_en  TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, creado_en)
) PARTITION BY RANGE (creado_en);

CREATE TABLE auditoria_2025 PARTITION OF auditoria
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- ============================================================
-- [4] REPORTES
-- ============================================================

CREATE TABLE fact_ventas (
    id           BIGSERIAL PRIMARY KEY,
    pedido_id    UUID,
    numero_orden VARCHAR(20) UNIQUE,
    total        NUMERIC(12,2),
    creado_en    TIMESTAMPTZ
);

CREATE TABLE fact_inventario (
    id             BIGSERIAL PRIMARY KEY,
    ingrediente_id UUID,
    tipo_movimiento VARCHAR(30) CHECK (tipo_movimiento IN ('ENTRADA','SALIDA','AJUSTE')),
    cantidad       NUMERIC(12,3),
    creado_en      TIMESTAMPTZ
);

-- =========================
-- FIX PEDIDOS
-- =========================
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
CHECK (estado IN ('BORRADOR','EN_PROCESO','ENVIADO','ENTREGADO',
                  'CANCELADO','COMPLETADO','REEMBOLSADO','FALLIDO'));

-- =========================
-- FIX ITEMS_PEDIDO
-- =========================
ALTER TABLE items_pedido
RENAME COLUMN precio_unit TO precio_unitario_snapshot;

ALTER TABLE items_pedido
RENAME COLUMN total TO total_item;

ALTER TABLE items_pedido
ADD COLUMN IF NOT EXISTS nombre_producto_snapshot VARCHAR(200) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS sku_producto_snapshot VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS subtotal_snapshot NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS impuesto_item NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS descuento_item NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS variantes_json JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS notas TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- =========================
-- DIRECCIONES_SERVICIO
-- =========================
CREATE TABLE IF NOT EXISTS direcciones_servicio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL,
    numero1 VARCHAR(255) NOT NULL,
    numero2 VARCHAR(255),
    calle VARCHAR(255) NOT NULL,
    ciudad VARCHAR(255) NOT NULL,
    UNIQUE (pedido_id, tipo)
);

-- =========================
-- OPCIONES SELECCIONADAS
-- =========================
CREATE TABLE IF NOT EXISTS opciones_seleccionadas_item_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_pedido_id UUID NOT NULL REFERENCES items_pedido(id) ON DELETE CASCADE,
    opcion_id VARCHAR(50) NOT NULL DEFAULT '',
    tipo_opcion_snapshot VARCHAR(50) NOT NULL,
    codigo_opcion_snapshot VARCHAR(50) NOT NULL,
    etiqueta_opcion_snapshot VARCHAR(100) NOT NULL
);

-- =========================
-- HISTORIAL ESTADOS
-- =========================
CREATE TABLE IF NOT EXISTS historial_estados_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(20) NOT NULL,
    estado_nuevo VARCHAR(20) NOT NULL,
    cambiado_por VARCHAR(50) NOT NULL,
    razon TEXT NOT NULL DEFAULT '',
    cambiado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_historial_pedido_cambiado_en
ON historial_estados_pedido (pedido_id, cambiado_en);











