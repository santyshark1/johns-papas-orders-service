/**
 * Pedidos Hooks
 * React Query hooks para gestión de órdenes
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPedidos,
  getPedidoById,
  createPedido,
  updatePedido,
  updatePedidoEstado,
  deletePedido,
  getPedidoEstadosHistory,
} from "@/services/pedidos/pedidosService";
import {
  Pedido,
  CreatePedidoRequest,
  UpdatePedidoRequest,
  UpdatePedidoEstadoRequest,
  PedidoEstado,
  HistorialEstadoPedido,
} from "@/shared/types/api";
import { QUERY_KEYS, CACHE_DURATION } from "@/shared/constants/api";

/**
 * usePedidos - Query para obtener lista de órdenes
 */
export function usePedidos(params?: {
  skip?: number;
  limit?: number;
  estado?: PedidoEstado;
  cliente_id?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.pedidos.lists(), params],
    queryFn: () => getPedidos(params),
    staleTime: CACHE_DURATION.SHORT,
    gcTime: CACHE_DURATION.MEDIUM,
  });
}

/**
 * usePedidoById - Query para obtener una orden específica
 */
export function usePedidoById(pedidoId: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.pedidos.detail(pedidoId || ""),
    queryFn: () => getPedidoById(pedidoId!),
    enabled: !!pedidoId,
    staleTime: CACHE_DURATION.SHORT,
    gcTime: CACHE_DURATION.MEDIUM,
  });
}

/**
 * useCreatePedido - Mutation para crear orden
 */
export function useCreatePedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pedidoData: CreatePedidoRequest) => createPedido(pedidoData),
    onSuccess: (newPedido) => {
      // Invalida lista de pedidos
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pedidos.lists(),
      });
      // Reportes también deben invalidarse
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reportes.ventas.lists(),
      });
    },
    onError: (error: Error) => {
      console.error("Error creando pedido:", error.message);
    },
  });
}

/**
 * useUpdatePedido - Mutation para actualizar orden
 */
export function useUpdatePedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pedidoId,
      updateData,
    }: {
      pedidoId: string;
      updateData: UpdatePedidoRequest;
    }) => updatePedido(pedidoId, updateData),
    onSuccess: (updatedPedido) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pedidos.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pedidos.detail(updatedPedido.id),
      });
    },
    onError: (error: Error) => {
      console.error("Error actualizando pedido:", error.message);
    },
  });
}

/**
 * useUpdatePedidoEstado - Mutation para actualizar estado de orden
 */
export function useUpdatePedidoEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pedidoId,
      estadoData,
    }: {
      pedidoId: string;
      estadoData: UpdatePedidoEstadoRequest;
    }) => updatePedidoEstado(pedidoId, estadoData),
    onSuccess: (updatedPedido) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pedidos.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pedidos.detail(updatedPedido.id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pedidos.estados(updatedPedido.id),
      });
    },
    onError: (error: Error) => {
      console.error("Error actualizando estado:", error.message);
    },
  });
}

/**
 * useDeletePedido - Mutation para cancelar/eliminar orden
 */
export function useDeletePedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pedidoId: string) => deletePedido(pedidoId),
    onSuccess: () => {
      // Invalida lista de pedidos
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pedidos.lists(),
      });
    },
    onError: (error: Error) => {
      console.error("Error cancelando pedido:", error.message);
    },
  });
}

/**
 * usePedidoEstadosHistory - Query para obtener historial de estados
 */
export function usePedidoEstadosHistory(
  pedidoId: string | null | undefined
) {
  return useQuery({
    queryKey: QUERY_KEYS.pedidos.estados(pedidoId || ""),
    queryFn: () => getPedidoEstadosHistory(pedidoId!),
    enabled: !!pedidoId,
    staleTime: CACHE_DURATION.MEDIUM,
    gcTime: CACHE_DURATION.LONG,
    retry: 2,
  });
}
