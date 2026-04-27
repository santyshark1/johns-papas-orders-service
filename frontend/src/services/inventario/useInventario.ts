/**
 * Inventario Hooks
 * React Query hooks para gestión de ingredientes y stock
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getIngredientes,
  getIngredienteById,
  createIngrediente,
  updateIngrediente,
  getMovimientos,
  createMovimiento,
  descontarStock,
} from "@/services/inventario/inventarioService";
import {
  Ingrediente,
  CreateIngredienteRequest,
  UpdateIngredienteRequest,
  MovimientoInventario,
  CreateMovimientoRequest,
  DescontarStockRequest,
  DescontarStockResponse,
} from "@/shared/types/api";
import { QUERY_KEYS, CACHE_DURATION } from "@/shared/constants/api";

/**
 * useIngredientes - Query para obtener lista de ingredientes
 */
export function useIngredientes(params?: {
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.ingredientes.lists(),
    queryFn: () => getIngredientes(params),
    staleTime: CACHE_DURATION.MEDIUM,
    gcTime: CACHE_DURATION.LONG,
    retry: 2,
  });
}

/**
 * useIngredienteById - Query para obtener un ingrediente específico
 */
export function useIngredienteById(ingredienteId: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.ingredientes.detail(ingredienteId || ""),
    queryFn: () => getIngredienteById(ingredienteId!),
    enabled: !!ingredienteId,
    staleTime: CACHE_DURATION.MEDIUM,
    gcTime: CACHE_DURATION.LONG,
    retry: 2,
  });
}

/**
 * useCreateIngrediente - Mutation para crear ingrediente
 */
export function useCreateIngrediente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIngredienteRequest) => createIngrediente(data),
    onSuccess: () => {
      // Invalida lista de ingredientes
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ingredientes.lists(),
      });
    },
    onError: (error: Error) => {
      console.error("Error creando ingrediente:", error.message);
    },
  });
}

/**
 * useUpdateIngrediente - Mutation para actualizar ingrediente
 */
export function useUpdateIngrediente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ingredienteId,
      data,
    }: {
      ingredienteId: string;
      data: UpdateIngredienteRequest;
    }) => updateIngrediente(ingredienteId, data),
    onSuccess: (updatedIngrediente) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ingredientes.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ingredientes.detail(updatedIngrediente.id),
      });
      // Reportes de inventario también
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reportes.inventario.resumen(),
      });
    },
    onError: (error: Error) => {
      console.error("Error actualizando ingrediente:", error.message);
    },
  });
}

/**
 * useMovimientos - Query para obtener movimientos de inventario
 */
export function useMovimientos(params?: {
  skip?: number;
  limit?: number;
  ingrediente_id?: string;
  tipo_movimiento?: string;
  desde?: string;
  hasta?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.movimientos.lists(), params],
    queryFn: () => getMovimientos(params),
    staleTime: CACHE_DURATION.MEDIUM,
    gcTime: CACHE_DURATION.LONG,
    retry: 2,
  });
}

/**
 * useCreateMovimiento - Mutation para registrar movimiento de inventario
 */
export function useCreateMovimiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMovimientoRequest) => createMovimiento(data),
    onSuccess: () => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.movimientos.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ingredientes.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reportes.inventario.all,
      });
    },
    onError: (error: Error) => {
      console.error("Error registrando movimiento:", error.message);
    },
  });
}

/**
 * useDescontarStock - Mutation para descontar stock (transaccional)
 */
export function useDescontarStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DescontarStockRequest) => descontarStock(request),
    onSuccess: () => {
      // Invalida ingredientes y movimientos
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ingredientes.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.movimientos.lists(),
      });
    },
    onError: (error: Error) => {
      console.error("Error descontando stock:", error.message);
    },
  });
}
