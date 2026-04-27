/**
 * Reportes Hooks
 * React Query hooks para reportes y analytics
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getVentas,
  getVentasResumen,
  getMovimientosInventario,
  getResumenInventario,
  getAuditoria,
} from "@/services/reportes/reportesService";
import {
  FactVenta,
  VentasResumen,
  FactInventario,
  ResumenInventario,
  AuditoriaLog,
  VentasFilterRequest,
  MovimientosFilterRequest,
  AuditoriaFilterRequest,
} from "@/shared/types/api";
import { QUERY_KEYS, CACHE_DURATION } from "@/shared/constants/api";

/**
 * useVentas - Query para obtener reporte de ventas
 */
export function useVentas(
  filters?: VentasFilterRequest & { skip?: number; limit?: number }
) {
  return useQuery({
    queryKey: [QUERY_KEYS.reportes.ventas.lists(), filters],
    queryFn: () => getVentas(filters),
    staleTime: CACHE_DURATION.LONG,
    gcTime: CACHE_DURATION.LONG,
    retry: 2,
  });
}

/**
 * useVentasResumen - Query para obtener resumen de ventas
 */
export function useVentasResumen(filters?: VentasFilterRequest) {
  return useQuery({
    queryKey: [QUERY_KEYS.reportes.ventas.resumen(), filters],
    queryFn: () => getVentasResumen(filters),
    staleTime: CACHE_DURATION.LONG,
    gcTime: CACHE_DURATION.LONG,
    retry: 2,
  });
}

/**
 * useMovimientosInventario - Query para obtener movimientos de inventario en reportes
 */
export function useMovimientosInventarioReport(
  filters?: MovimientosFilterRequest & { skip?: number; limit?: number }
) {
  return useQuery({
    queryKey: [QUERY_KEYS.reportes.inventario.movimientos(), filters],
    queryFn: () => getMovimientosInventario(filters),
    staleTime: CACHE_DURATION.LONG,
    gcTime: CACHE_DURATION.LONG,
    retry: 2,
  });
}

/**
 * useResumenInventario - Query para obtener resumen de inventario
 */
export function useResumenInventario() {
  return useQuery({
    queryKey: QUERY_KEYS.reportes.inventario.resumen(),
    queryFn: () => getResumenInventario(),
    staleTime: CACHE_DURATION.LONG,
    gcTime: CACHE_DURATION.LONG,
    retry: 2,
  });
}

/**
 * useAuditoria - Query para obtener logs de auditoría
 */
export function useAuditoria(
  filters?: AuditoriaFilterRequest & { skip?: number; limit?: number }
) {
  return useQuery({
    queryKey: [QUERY_KEYS.reportes.auditoria.lists(), filters],
    queryFn: () => getAuditoria(filters),
    staleTime: CACHE_DURATION.LONG,
    gcTime: CACHE_DURATION.LONG,
    retry: 2,
  });
}
