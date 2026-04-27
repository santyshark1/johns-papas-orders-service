/**
 * Reportes Service
 * Handles analytics and audit reports (sales, inventory, audit logs)
 */

import { axiosClient } from "@/services/httpClient/axiosClient";
import {
  FactVenta,
  VentasResumen,
  FactInventario,
  ResumenInventario,
  AuditoriaLog,
  VentasFilterRequest,
  MovimientosFilterRequest,
  AuditoriaFilterRequest,
  VentasListResponse,
  AuditoriaListResponse,
} from "@/shared/types/api";
import { REPORTES_ENDPOINTS } from "@/shared/constants/api";
import { extractErrorMessage, normalizeListResponse, buildQueryParams } from "@/services/httpClient/utils";

/**
 * Get Ventas - Obtiene reporte de ventas con filtros opcionales
 */
export async function getVentas(
  filters?: VentasFilterRequest & { skip?: number; limit?: number }
): Promise<FactVenta[]> {
  try {
    const response = await axiosClient.get<FactVenta[] | VentasListResponse>(
      REPORTES_ENDPOINTS.GET_VENTAS,
      { params: filters }
    );

    return normalizeListResponse<FactVenta>(response.data);
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al obtener reporte de ventas: ${message}`);
  }
}

/**
 * Get Ventas Resumen - Obtiene resumen de ventas (totales, promedio, etc.)
 */
export async function getVentasResumen(
  filters?: VentasFilterRequest
): Promise<VentasResumen> {
  try {
    const response = await axiosClient.get<VentasResumen>(
      REPORTES_ENDPOINTS.GET_VENTAS_RESUMEN,
      { params: filters }
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al obtener resumen de ventas: ${message}`);
  }
}

/**
 * Get Movimientos Inventario - Obtiene reporte de movimientos de inventario
 */
export async function getMovimientosInventario(
  filters?: MovimientosFilterRequest & { skip?: number; limit?: number }
): Promise<FactInventario[]> {
  try {
    const response = await axiosClient.get<
      FactInventario[] | { items: FactInventario[]; total: number }
    >(REPORTES_ENDPOINTS.GET_MOVIMIENTOS_INVENTARIO, { params: filters });

    return normalizeListResponse<FactInventario>(response.data);
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al obtener movimientos de inventario: ${message}`);
  }
}

/**
 * Get Resumen Inventario - Obtiene resumen agrupado por tipo de movimiento
 */
export async function getResumenInventario(): Promise<ResumenInventario> {
  try {
    const response = await axiosClient.get<ResumenInventario>(
      REPORTES_ENDPOINTS.GET_RESUMEN_INVENTARIO
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al obtener resumen de inventario: ${message}`);
  }
}

/**
 * Get Auditoria - Obtiene logs de auditoría
 */
export async function getAuditoria(
  filters?: AuditoriaFilterRequest & { skip?: number; limit?: number }
): Promise<AuditoriaLog[]> {
  try {
    const response = await axiosClient.get<
      AuditoriaLog[] | AuditoriaListResponse
    >(REPORTES_ENDPOINTS.GET_AUDITORIA, { params: filters });

    return normalizeListResponse<AuditoriaLog>(response.data);
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al obtener auditoría: ${message}`);
  }
}
