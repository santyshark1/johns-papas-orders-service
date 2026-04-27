/**
 * API Types - Tipos TypeScript para respuestas del backend
 * Basados en los modelos y schemas de Pydantic del backend
 */

import { UUID } from "crypto";

// ============================================================================
// TIPOS COMUNES
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface ApiError {
  detail: string | string[];
  status?: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

// ============================================================================
// USUARIO SERVICE TYPES
// ============================================================================

export interface Usuario {
  id: string; // UUID
  nombre: string | null;
  email: string | null;
  roles: string[]; // Array de nombres de roles
}

export interface UsuarioWithRoleDetails extends Usuario {
  roleIds?: string[];
}

export interface Rol {
  id: string; // UUID
  nombre: string | null;
  permisos?: Permiso[];
}

export interface Permiso {
  id: string; // UUID
  nombre: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  user?: Usuario; // Opcional, algunos endpoints incluyen user data
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface CreateUserRequest {
  nombre: string;
  email: string;
  password: string;
  confirm_password: string;
  roleIds?: string[];
}

export interface UpdateUserRolesRequest {
  roleIds: string[];
}

// ============================================================================
// PEDIDOS SERVICE TYPES
// ============================================================================

export type PedidoEstado =
  | "BORRADOR"
  | "EN_PROCESO"
  | "ENVIADO"
  | "ENTREGADO"
  | "CANCELADO"
  | "COMPLETADO"
  | "REEMBOLSADO"
  | "FALLIDO";

export type TipoEntrega = "DOMICILIO" | "RECOGIDA" | "RETIRO_TIENDA";
export type Plataforma = "WEB" | "MOVIL" | "TIENDA_FISICA";

export interface OpcionSeleccionada {
  opcion_id: string;
  tipo_opcion_snapshot: string;
  codigo_opcion_snapshot: string;
  etiqueta_opcion_snapshot: string;
}

export interface ItemPedido {
  id?: string; // UUID (opcional en create)
  producto_id: string;
  cantidad: number;
  precio_unitario_snapshot: number;
  nombre_producto_snapshot: string;
  sku_producto_snapshot?: string | null;
  impuesto_item: number;
  descuento_item: number;
  variantes_json: Record<string, unknown>;
  notas?: string | null;
  opciones_seleccionadas?: OpcionSeleccionada[] | null;
}

export interface DireccionServicio {
  tipo: string; // ENVIO, FACTURACION, etc.
  numero1: string;
  numero2?: string | null;
  calle: string;
  ciudad: string;
}

export interface HistorialEstadoPedido {
  id: string; // UUID
  estado: PedidoEstado;
  razon?: string | null;
  creado_en: string; // ISO datetime
  usuario_id?: string | null; // UUID
}

export interface Pedido {
  id: string; // UUID
  numero_orden: string;
  cliente_id: string; // UUID
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  tienda_id: string; // UUID
  tienda_nombre: string;
  plataforma: Plataforma;
  entrega: TipoEntrega;
  estado: PedidoEstado;
  subtotal: number;
  impuestos: number;
  servicio: number;
  descuento: number;
  total: number;
  creado_en: string; // ISO datetime
  items: ItemPedido[];
  historial_estados?: HistorialEstadoPedido[];
  direcciones?: DireccionServicio[];
}

export interface CreatePedidoRequest {
  cliente_id: string; // UUID
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  tienda_id: string; // UUID
  tienda_nombre: string;
  plataforma: Plataforma;
  entrega: TipoEntrega;
  subtotal: number;
  impuestos: number;
  servicio: number;
  descuento?: number;
  items: ItemPedido[];
  direcciones?: DireccionServicio[];
}

export interface UpdatePedidoRequest {
  estado?: PedidoEstado;
  plataforma?: Plataforma;
  entrega?: TipoEntrega;
  subtotal?: number;
  impuestos?: number;
  servicio?: number;
  descuento?: number;
}

export interface UpdatePedidoEstadoRequest {
  estado: PedidoEstado;
  razon?: string;
}

// ============================================================================
// INVENTARIO SERVICE TYPES
// ============================================================================

export interface Ingrediente {
  id: string; // UUID
  nombre: string;
  stock_actual: number;
  costo_unitario: number;
}

export interface CreateIngredienteRequest {
  nombre: string;
  stock_actual?: number;
  costo_unitario?: number;
}

export interface UpdateIngredienteRequest {
  stock_actual?: number;
  costo_unitario?: number;
}

export type TipoMovimiento =
  | "ENTRADA"
  | "SALIDA"
  | "AJUSTE"
  | "DEVOLUCION"
  | "PERDIDA";

export interface MovimientoInventario {
  id: string; // UUID
  ingrediente_id: string; // UUID
  cantidad: number;
  tipo_movimiento: TipoMovimiento;
  razon?: string | null;
  usuario_id?: string | null; // UUID
  creado_en: string; // ISO datetime
}

export interface CreateMovimientoRequest {
  ingrediente_id: string; // UUID
  cantidad: number;
  tipo_movimiento: TipoMovimiento;
  razon?: string;
}

export interface DescontarStockRequest {
  detalles: Array<{
    ingrediente_id: string; // UUID
    cantidad: number;
  }>;
}

export interface DescontarStockResponse {
  success: boolean;
  message?: string;
  fallos?: Array<{
    ingrediente_id: string;
    razon: string;
  }>;
}

// ============================================================================
// REPORTES SERVICE TYPES
// ============================================================================

export interface FactVenta {
  id: string; // UUID
  pedido_id: string; // UUID
  numero_orden: string;
  cliente_id: string; // UUID
  cliente_nombre: string;
  total: number;
  plataforma: Plataforma;
  entrega: TipoEntrega;
  estado: PedidoEstado;
  creado_en: string; // ISO datetime
}

export interface VentasResumen {
  total_ventas: number;
  cantidad_pedidos: number;
  promedio_por_pedido: number;
  periodo: {
    desde?: string; // ISO date
    hasta?: string; // ISO date
  };
}

export interface FactInventario {
  id: string; // UUID
  ingrediente_id: string; // UUID
  ingrediente_nombre: string;
  cantidad: number;
  tipo_movimiento: TipoMovimiento;
  costo_unitario: number;
  costo_total: number;
  creado_en: string; // ISO datetime
}

export interface ResumenInventario {
  [key: string]: number; // {ENTRADA: 100, SALIDA: 50, AJUSTE: 5}
}

export interface AuditoriaLog {
  id: string; // UUID
  usuario_id?: string | null; // UUID
  accion?: string | null;
  creado_en: string; // ISO datetime
}

// Requests para reportes
export interface VentasFilterRequest {
  desde?: string; // ISO date
  hasta?: string; // ISO date
  cliente_id?: string; // UUID
  estado?: PedidoEstado;
  plataforma?: Plataforma;
}

export interface MovimientosFilterRequest {
  desde?: string; // ISO date
  hasta?: string; // ISO date
  ingrediente_id?: string; // UUID
  tipo_movimiento?: TipoMovimiento;
  usuario_id?: string; // UUID
}

export interface AuditoriaFilterRequest {
  desde?: string; // ISO date
  hasta?: string; // ISO date
  usuario_id?: string; // UUID
  accion?: string;
}

// ============================================================================
// TIPOS PARA RESPUESTAS DE LISTADO (con paginación)
// ============================================================================

export interface PedidosListResponse {
  items: Pedido[];
  total: number;
  skip?: number;
  limit?: number;
}

export interface UsuariosListResponse {
  items: Usuario[];
  total: number;
  skip?: number;
  limit?: number;
}

export interface IngredientesListResponse {
  items: Ingrediente[];
  total: number;
  skip?: number;
  limit?: number;
}

export interface MovimientosListResponse {
  items: MovimientoInventario[];
  total: number;
  skip?: number;
  limit?: number;
}

export interface VentasListResponse {
  items: FactVenta[];
  total: number;
  skip?: number;
  limit?: number;
}

export interface AuditoriaListResponse {
  items: AuditoriaLog[];
  total: number;
  skip?: number;
  limit?: number;
}

// ============================================================================
// TIPOS PARA EL ESTADO DE LA APP (Zustand stores)
// ============================================================================

export interface AuthState {
  user: Usuario | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: Usuario, token: string, refreshToken?: string) => void;
  clearSession: () => void;
  setToken: (token: string) => void;
}
