-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.auditoria (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid,
  accion character varying,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT auditoria_pkey PRIMARY KEY (id, creado_en)
);
CREATE TABLE public.auditoria_2025 (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid,
  accion character varying,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT auditoria_2025_pkey PRIMARY KEY (id, creado_en)
);
CREATE TABLE public.direcciones_servicio (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL,
  tipo character varying NOT NULL,
  numero1 character varying NOT NULL,
  numero2 character varying,
  calle character varying NOT NULL,
  ciudad character varying NOT NULL,
  CONSTRAINT direcciones_servicio_pkey PRIMARY KEY (id),
  CONSTRAINT direcciones_servicio_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id)
);
CREATE TABLE public.fact_inventario (
  id bigint NOT NULL DEFAULT nextval('fact_inventario_id_seq'::regclass),
  ingrediente_id uuid,
  tipo_movimiento character varying CHECK (tipo_movimiento::text = ANY (ARRAY['ENTRADA'::character varying, 'SALIDA'::character varying, 'AJUSTE'::character varying]::text[])),
  cantidad numeric,
  creado_en timestamp with time zone,
  CONSTRAINT fact_inventario_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fact_ventas (
  id bigint NOT NULL DEFAULT nextval('fact_ventas_id_seq'::regclass),
  pedido_id uuid,
  numero_orden character varying UNIQUE,
  total numeric,
  creado_en timestamp with time zone,
  CONSTRAINT fact_ventas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.historial_estados_pedido (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL,
  estado_anterior character varying NOT NULL,
  estado_nuevo character varying NOT NULL,
  cambiado_por character varying NOT NULL,
  razon text NOT NULL DEFAULT ''::text,
  cambiado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT historial_estados_pedido_pkey PRIMARY KEY (id),
  CONSTRAINT historial_estados_pedido_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id)
);
CREATE TABLE public.ingredientes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  stock_actual numeric NOT NULL DEFAULT 0,
  costo_unitario numeric NOT NULL DEFAULT 0,
  CONSTRAINT ingredientes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.items_pedido (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL,
  producto_id character varying NOT NULL,
  cantidad integer NOT NULL CHECK (cantidad > 0),
  precio_unitario_snapshot numeric NOT NULL,
  total_item numeric NOT NULL,
  nombre_producto_snapshot character varying NOT NULL DEFAULT ''::character varying,
  sku_producto_snapshot character varying NOT NULL DEFAULT ''::character varying,
  subtotal_snapshot numeric NOT NULL DEFAULT 0,
  impuesto_item numeric NOT NULL DEFAULT 0,
  descuento_item numeric NOT NULL DEFAULT 0,
  variantes_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  notas text NOT NULL DEFAULT ''::text,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT items_pedido_pkey PRIMARY KEY (id),
  CONSTRAINT items_pedido_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id)
);
CREATE TABLE public.movimientos_inventario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ingrediente_id uuid NOT NULL,
  tipo_movimiento character varying CHECK (tipo_movimiento::text = ANY (ARRAY['ENTRADA'::character varying, 'SALIDA'::character varying, 'AJUSTE'::character varying]::text[])),
  cantidad numeric,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT movimientos_inventario_pkey PRIMARY KEY (id),
  CONSTRAINT movimientos_inventario_ingrediente_id_fkey FOREIGN KEY (ingrediente_id) REFERENCES public.ingredientes(id)
);
CREATE TABLE public.opciones_seleccionadas_item_pedido (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_pedido_id uuid NOT NULL,
  opcion_id character varying NOT NULL DEFAULT ''::character varying,
  tipo_opcion_snapshot character varying NOT NULL,
  codigo_opcion_snapshot character varying NOT NULL,
  etiqueta_opcion_snapshot character varying NOT NULL,
  CONSTRAINT opciones_seleccionadas_item_pedido_pkey PRIMARY KEY (id),
  CONSTRAINT opciones_seleccionadas_item_pedido_item_pedido_id_fkey FOREIGN KEY (item_pedido_id) REFERENCES public.items_pedido(id)
);
CREATE TABLE public.pedidos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  numero_orden character varying NOT NULL UNIQUE,
  cliente_id uuid NOT NULL,
  cliente_nombre character varying NOT NULL,
  cliente_email character varying NOT NULL,
  cliente_telefono character varying NOT NULL,
  tienda_id uuid NOT NULL,
  tienda_nombre character varying NOT NULL,
  plataforma character varying NOT NULL CHECK (plataforma::text = ANY (ARRAY['WEB'::character varying, 'MOVIL'::character varying, 'TIENDA_FISICA'::character varying]::text[])),
  entrega character varying NOT NULL CHECK (entrega::text = ANY (ARRAY['DOMICILIO'::character varying, 'RECOGIDA'::character varying, 'RETIRO_TIENDA'::character varying]::text[])),
  estado character varying NOT NULL DEFAULT 'BORRADOR'::character varying CHECK (estado::text = ANY (ARRAY['BORRADOR'::character varying, 'EN_PROCESO'::character varying, 'ENVIADO'::character varying, 'ENTREGADO'::character varying, 'CANCELADO'::character varying, 'COMPLETADO'::character varying, 'REEMBOLSADO'::character varying, 'FALLIDO'::character varying]::text[])),
  subtotal numeric NOT NULL CHECK (subtotal >= 0::numeric),
  impuestos numeric NOT NULL CHECK (impuestos >= 0::numeric),
  servicio numeric NOT NULL CHECK (servicio >= 0::numeric),
  descuento numeric NOT NULL DEFAULT 0 CHECK (descuento >= 0::numeric),
  total numeric NOT NULL CHECK (total >= 0::numeric),
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pedidos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.permisos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo character varying UNIQUE,
  CONSTRAINT permisos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rol_permisos (
  rol_id uuid NOT NULL,
  permiso_id uuid NOT NULL,
  CONSTRAINT rol_permisos_pkey PRIMARY KEY (rol_id, permiso_id),
  CONSTRAINT rol_permisos_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES public.permisos(id)
);
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying UNIQUE,
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.usuario_roles (
  usuario_id uuid NOT NULL,
  rol_id uuid NOT NULL,
  tienda_id uuid NOT NULL,
  CONSTRAINT usuario_roles_pkey PRIMARY KEY (usuario_id, rol_id, tienda_id),
  CONSTRAINT usuario_roles_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT usuario_roles_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id)
);
CREATE TABLE public.usuarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying,
  email character varying UNIQUE,
  password_hash text,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);