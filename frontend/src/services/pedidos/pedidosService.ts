/**
 * Pedidos Service
 * Handles order management (CRUD + status updates)
 */

import { axiosClient } from "@/services/httpClient/axiosClient";
import {
  Pedido,
  CreatePedidoRequest,
  UpdatePedidoRequest,
  UpdatePedidoEstadoRequest,
  PedidoEstado,
  PedidosListResponse,
  HistorialEstadoPedido,
} from "@/shared/types/api";
import { PEDIDOS_ENDPOINTS } from "@/shared/constants/api";
import { extractErrorMessage, normalizeListResponse } from "@/services/httpClient/utils";

/**
 * Get Pedidos - Obtiene lista de órdenes
 */
export async function getPedidos(params?: {
  skip?: number;
  limit?: number;
  estado?: PedidoEstado;
  cliente_id?: string;
}): Promise<Pedido[]> {
  try {
    const response = await axiosClient.get<Pedido[] | PedidosListResponse>(
      PEDIDOS_ENDPOINTS.GET_PEDIDOS,
      { params }
    );

    return normalizeListResponse<Pedido>(response.data);
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al obtener órdenes: ${message}`);
  }
}

/**
 * Get Pedido by ID - Obtiene una orden específica
 */
export async function getPedidoById(pedidoId: string): Promise<Pedido> {
  try {
    const response = await axiosClient.get<Pedido>(
      PEDIDOS_ENDPOINTS.GET_PEDIDO_BY_ID(pedidoId)
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al obtener orden: ${message}`);
  }
}

/**
 * Create Pedido - Crea una nueva orden
 */
export async function createPedido(
  pedidoData: CreatePedidoRequest
): Promise<Pedido> {
  try {
    const response = await axiosClient.post<Pedido>(
      PEDIDOS_ENDPOINTS.CREATE_PEDIDO,
      pedidoData
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al crear orden: ${message}`);
  }
}

/**
 * Update Pedido - Actualiza una orden existente
 */
export async function updatePedido(
  pedidoId: string,
  updateData: UpdatePedidoRequest
): Promise<Pedido> {
  try {
    const response = await axiosClient.put<Pedido>(
      PEDIDOS_ENDPOINTS.UPDATE_PEDIDO(pedidoId),
      updateData
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al actualizar orden: ${message}`);
  }
}

/**
 * Update Pedido Estado - Actualiza el estado de una orden
 */
export async function updatePedidoEstado(
  pedidoId: string,
  estadoData: UpdatePedidoEstadoRequest
): Promise<Pedido> {
  try {
    const response = await axiosClient.put<Pedido>(
      PEDIDOS_ENDPOINTS.UPDATE_PEDIDO_ESTADO(pedidoId),
      estadoData
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al actualizar estado de orden: ${message}`);
  }
}

/**
 * Delete Pedido - Cancela/elimina una orden
 */
export async function deletePedido(pedidoId: string): Promise<void> {
  try {
    await axiosClient.delete(PEDIDOS_ENDPOINTS.DELETE_PEDIDO(pedidoId));
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al cancelar orden: ${message}`);
  }
}

/**
 * Get Pedido Estados History - Obtiene el historial de estados de una orden
 */
export async function getPedidoEstadosHistory(
  pedidoId: string
): Promise<HistorialEstadoPedido[]> {
  try {
    const response = await axiosClient.get<
      HistorialEstadoPedido[] | { items: HistorialEstadoPedido[] }
    >(PEDIDOS_ENDPOINTS.GET_PEDIDO_ESTADOS(pedidoId));

    return normalizeListResponse<HistorialEstadoPedido>(response.data);
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al obtener historial de estados: ${message}`);
  }
}
