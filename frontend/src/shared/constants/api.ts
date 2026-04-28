/**
 * API Constants - Configuración centralizada de endpoints y rutas
 * Define todas las URLs base y rutas de endpoints para cada servicio
 */

// Base URL for API (only when a direct backend URL is configured)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Proxy Base URLs - Rutas mediante Next.js proxy routes
 * Estas rutas forwardean peticiones a los microservicios en Render
 */
export const PROXY_BASE_URLS = {
  USUARIO_SERVICE: "/api-proxy/usuario-svc",
  PEDIDOS_SERVICE: "/api-proxy/pedidos-svc",
  INVENTARIO_SERVICE: "/api-proxy/inventario-svc",
  REPORTES_SERVICE: "/api-proxy/reportes-svc",
} as const;

/**
 * Service Endpoints - Rutas completas de cada microservicio
 */

// USUARIO SERVICE - Autenticación y gestión de usuarios
export const USUARIO_ENDPOINTS = {
  // Auth
  LOGIN: `${PROXY_BASE_URLS.USUARIO_SERVICE}/auth/login`,
  REGISTER: `${PROXY_BASE_URLS.USUARIO_SERVICE}/auth/register`,
  REFRESH_TOKEN: `${PROXY_BASE_URLS.USUARIO_SERVICE}/auth/refresh`,

  // Users
  GET_USERS: `${PROXY_BASE_URLS.USUARIO_SERVICE}/usuarios`,
  GET_USER_BY_ID: (id: string) =>
    `${PROXY_BASE_URLS.USUARIO_SERVICE}/usuarios/${id}`,
  UPDATE_USER_ROLES: (id: string) =>
    `${PROXY_BASE_URLS.USUARIO_SERVICE}/usuarios/${id}/roles`,
  DELETE_USER: (id: string) =>
    `${PROXY_BASE_URLS.USUARIO_SERVICE}/usuarios/${id}`,

  // Roles
  GET_ROLES: `${PROXY_BASE_URLS.USUARIO_SERVICE}/roles`,
  GET_ROLE_BY_ID: (id: string) =>
    `${PROXY_BASE_URLS.USUARIO_SERVICE}/roles/${id}`,
  CREATE_ROLE: `${PROXY_BASE_URLS.USUARIO_SERVICE}/roles`,
  UPDATE_ROLE: (id: string) =>
    `${PROXY_BASE_URLS.USUARIO_SERVICE}/roles/${id}`,
} as const;

// PEDIDOS SERVICE - Gestión de órdenes
export const PEDIDOS_ENDPOINTS = {
  GET_PEDIDOS: `${PROXY_BASE_URLS.PEDIDOS_SERVICE}/pedidos`,
  GET_PEDIDO_BY_ID: (id: string) =>
    `${PROXY_BASE_URLS.PEDIDOS_SERVICE}/pedidos/${id}`,
  CREATE_PEDIDO: `${PROXY_BASE_URLS.PEDIDOS_SERVICE}/pedidos`,
  UPDATE_PEDIDO: (id: string) =>
    `${PROXY_BASE_URLS.PEDIDOS_SERVICE}/pedidos/${id}`,
  DELETE_PEDIDO: (id: string) =>
    `${PROXY_BASE_URLS.PEDIDOS_SERVICE}/pedidos/${id}`,
  GET_PEDIDO_ESTADOS: (id: string) =>
    `${PROXY_BASE_URLS.PEDIDOS_SERVICE}/pedidos/${id}/estados`,
  UPDATE_PEDIDO_ESTADO: (id: string) =>
    `${PROXY_BASE_URLS.PEDIDOS_SERVICE}/pedidos/${id}/estados`,
} as const;

// INVENTARIO SERVICE - Gestión de ingredientes y stock
export const INVENTARIO_ENDPOINTS = {
  // Ingredientes
  GET_INGREDIENTES: `${PROXY_BASE_URLS.INVENTARIO_SERVICE}/ingredientes`,
  GET_INGREDIENTE_BY_ID: (id: string) =>
    `${PROXY_BASE_URLS.INVENTARIO_SERVICE}/ingredientes/${id}`,
  CREATE_INGREDIENTE: `${PROXY_BASE_URLS.INVENTARIO_SERVICE}/ingredientes`,
  UPDATE_INGREDIENTE: (id: string) =>
    `${PROXY_BASE_URLS.INVENTARIO_SERVICE}/ingredientes/${id}`,

  // Movimientos
  GET_MOVIMIENTOS: `${PROXY_BASE_URLS.INVENTARIO_SERVICE}/inventario/movimientos`,
  CREATE_MOVIMIENTO: `${PROXY_BASE_URLS.INVENTARIO_SERVICE}/inventario/movimientos`,
  DESCONTAR_STOCK: `${PROXY_BASE_URLS.INVENTARIO_SERVICE}/inventario/descontar`,
} as const;

// REPORTES SERVICE - Analytics y auditoría
export const REPORTES_ENDPOINTS = {
  // Ventas
  GET_VENTAS: `${PROXY_BASE_URLS.REPORTES_SERVICE}/reportes/ventas`,
  GET_VENTAS_RESUMEN: `${PROXY_BASE_URLS.REPORTES_SERVICE}/reportes/ventas/resumen`,

  // Inventario
  GET_MOVIMIENTOS_INVENTARIO: `${PROXY_BASE_URLS.REPORTES_SERVICE}/reportes/inventario/movimientos`,
  GET_RESUMEN_INVENTARIO: `${PROXY_BASE_URLS.REPORTES_SERVICE}/reportes/inventario/resumen`,

  // Auditoría
  GET_AUDITORIA: `${PROXY_BASE_URLS.REPORTES_SERVICE}/reportes/auditoria`,
} as const;

/**
 * API Timeouts (en milisegundos)
 */
export const API_TIMEOUTS = {
  DEFAULT: 15000, // 15 segundos
  UPLOAD: 30000, // 30 segundos para uploads
  REPORTS: 45000, // 45 segundos para reportes grandes
} as const;

/**
 * Cache Duration (en segundos)
 * Usado por React Query para determinar staleTime
 */
export const CACHE_DURATION = {
  IMMEDIATE: 0,
  SHORT: 5 * 60 * 1000,
  MEDIUM: 15 * 60 * 1000,
  LONG: 60 * 60 * 1000,
  VERY_LONG: 24 * 60 * 60 * 1000,
} as const;

/**
 * Query Keys para React Query
 */
const AUTH_QUERY_KEY = ["auth"] as const;
const USUARIOS_QUERY_KEY = ["usuarios"] as const;
const PEDIDOS_QUERY_KEY = ["pedidos"] as const;
const INGREDIENTES_QUERY_KEY = ["ingredientes"] as const;
const MOVIMIENTOS_QUERY_KEY = ["movimientos"] as const;
const REPORTES_QUERY_KEY = ["reportes"] as const;
const REPORTES_VENTAS_QUERY_KEY = [...REPORTES_QUERY_KEY, "ventas"] as const;
const REPORTES_INVENTARIO_QUERY_KEY = [...REPORTES_QUERY_KEY, "inventario"] as const;
const REPORTES_AUDITORIA_QUERY_KEY = [...REPORTES_QUERY_KEY, "auditoria"] as const;

export const QUERY_KEYS = {
  // Auth
  auth: {
    all: AUTH_QUERY_KEY,
    user: () => [...AUTH_QUERY_KEY, "user"] as const,
  },

  // Usuarios
  usuarios: {
    all: USUARIOS_QUERY_KEY,
    lists: () => [...USUARIOS_QUERY_KEY, "list"] as const,
    detail: (id: string) => [...USUARIOS_QUERY_KEY, "detail", id] as const,
  },

  // Pedidos
  pedidos: {
    all: PEDIDOS_QUERY_KEY,
    lists: () => [...PEDIDOS_QUERY_KEY, "list"] as const,
    detail: (id: string) => [...PEDIDOS_QUERY_KEY, "detail", id] as const,
    estados: (id: string) => [...PEDIDOS_QUERY_KEY, "estados", id] as const,
  },

  // Ingredientes
  ingredientes: {
    all: INGREDIENTES_QUERY_KEY,
    lists: () => [...INGREDIENTES_QUERY_KEY, "list"] as const,
    detail: (id: string) => [...INGREDIENTES_QUERY_KEY, "detail", id] as const,
  },

  // Movimientos de Inventario
  movimientos: {
    all: MOVIMIENTOS_QUERY_KEY,
    lists: () => [...MOVIMIENTOS_QUERY_KEY, "list"] as const,
    byIngrediente: (ingredienteId: string) => [...MOVIMIENTOS_QUERY_KEY, "ingrediente", ingredienteId] as const,
  },

  // Reportes
  reportes: {
    all: REPORTES_QUERY_KEY,
    ventas: {
      all: REPORTES_VENTAS_QUERY_KEY,
      lists: () => [...REPORTES_VENTAS_QUERY_KEY, "list"] as const,
      resumen: () => [...REPORTES_VENTAS_QUERY_KEY, "resumen"] as const,
    },
    inventario: {
      all: REPORTES_INVENTARIO_QUERY_KEY,
      movimientos: () => [...REPORTES_INVENTARIO_QUERY_KEY, "movimientos"] as const,
      resumen: () => [...REPORTES_INVENTARIO_QUERY_KEY, "resumen"] as const,
    },
    auditoria: {
      all: REPORTES_AUDITORIA_QUERY_KEY,
      lists: () => [...REPORTES_AUDITORIA_QUERY_KEY, "list"] as const,
    },
  },
} as const;

/**
 * HTTP Headers predeterminados
 */
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
} as const;

/**
 * Error Messages para errores comunes
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Error de conexión con el servidor. Intenta de nuevo.",
  UNAUTHORIZED: "No autorizado. Por favor inicia sesión.",
  FORBIDDEN: "No tienes permisos para realizar esta acción.",
  NOT_FOUND: "El recurso solicitado no existe.",
  VALIDATION_ERROR: "Los datos proporcionados no son válidos.",
  SERVER_ERROR: "Error del servidor. Intenta de nuevo más tarde.",
  TIMEOUT: "La solicitud tardó demasiado. Intenta de nuevo.",
  UNKNOWN_ERROR: "Ocurrió un error inesperado. Intenta de nuevo.",
} as const;
