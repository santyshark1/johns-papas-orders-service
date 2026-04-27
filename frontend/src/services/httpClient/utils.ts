/**
 * HTTP Client Utilities
 * Funciones compartidas para manejo de errores, headers, y requests/responses
 */

import { ERROR_MESSAGES } from "@/shared/constants/api";
import { ApiError } from "@/shared/types/api";

/**
 * Extrae el mensaje de error de una respuesta de API
 * Maneja diferentes formatos de errores devueltos por FastAPI
 */
export function extractErrorMessage(error: unknown): string {
  // Si es un objeto con propiedad 'detail'
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiError;

    if (typeof apiError.detail === "string") {
      return apiError.detail;
    }

    if (Array.isArray(apiError.detail)) {
      return apiError.detail.join(", ");
    }

    if ("message" in apiError) {
      return (apiError as any).message;
    }
  }

  // Si es un string
  if (typeof error === "string") {
    return error;
  }

  // Si es un Error de JavaScript
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Mapea códigos HTTP a mensajes de error en español
 */
export function getHttpErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 408:
    case 504:
      return ERROR_MESSAGES.TIMEOUT;
    case 5000:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      if (status >= 500) {
        return ERROR_MESSAGES.SERVER_ERROR;
      }
      return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
}

/**
 * Construye headers HTTP con autenticación
 */
export function buildAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Extrae el contenido de respuesta según el tipo de contenido
 */
export async function parseResponseContent(
  response: Response
): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  if (contentType?.includes("text/")) {
    return response.text();
  }

  return response.arrayBuffer();
}

/**
 * Valida si una respuesta es exitosa
 * Retorna true para status 2xx, false para otros
 */
export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * Normaliza arrays de respuesta
 * Algunos endpoints devuelven directamente un array, otros {items: [], total: n}
 */
export function normalizeListResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) {
      return obj.items as T[];
    }
    if (Array.isArray(obj.data)) {
      return obj.data as T[];
    }
  }

  return [];
}

/**
 * Verifica si el error es debido a falta de autenticación
 */
export function isAuthenticationError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    const apiError = error as any;
    return (
      apiError.status === 401 ||
      apiError.detail?.includes("token") ||
      apiError.detail?.includes("authentication") ||
      apiError.detail?.includes("not authenticated")
    );
  }
  return false;
}

/**
 * Verifica si el error es por timeout
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("timeout") ||
      error.message.includes("Timeout") ||
      error.message.includes("ERR_NETWORK")
    );
  }
  return false;
}

/**
 * Verifica si el error es de red
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("Network") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("ENOTFOUND")
    );
  }
  return false;
}

/**
 * Formatea un UUID para asegurar consistencia
 */
export function normalizeUUID(uuid: string): string {
  return uuid.toLowerCase().trim();
}

/**
 * Valida si un string es un UUID válido (v4)
 */
export function isValidUUID(uuid: string): boolean {
  const uuidv4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(uuid);
}

/**
 * Retraso con exponential backoff para reintentos
 * @param attempt Número de intento (0-based)
 * @param baseDelay Delay base en ms
 * @returns Delay en ms
 */
export function exponentialBackoffDelay(
  attempt: number,
  baseDelay: number = 1000
): number {
  return baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
}

/**
 * Deserializa números que vienen como strings de PostgreSQL (NUMERIC)
 */
export function deserializeNumeric(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  return 0;
}

/**
 * Serializa números para enviar al backend
 */
export function serializeNumeric(value: unknown): string | number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return value;
  return 0;
}

/**
 * Limpia un objeto de valores undefined y null
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined && value !== null)
  ) as Partial<T>;
}

/**
 * Construye query params a partir de un objeto
 */
export function buildQueryParams(params: Record<string, any>): string {
  const cleaned = cleanObject(params);
  const searchParams = new URLSearchParams();

  Object.entries(cleaned).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
