/**
 * Inventario Service
 * Handles ingredients management and inventory movements
 */

import { axiosClient } from "@/services/httpClient/axiosClient";
import {
  Ingrediente,
  CreateIngredienteRequest,
  UpdateIngredienteRequest,
  MovimientoInventario,
  CreateMovimientoRequest,
  DescontarStockRequest,
  DescontarStockResponse,
  IngredientesListResponse,
  MovimientosListResponse,
} from "@/shared/types/api";
import { INVENTARIO_ENDPOINTS } from "@/shared/constants/api";
import { extractErrorMessage, normalizeListResponse } from "@/services/httpClient/utils";

/**
 * Get Ingredientes - Obtiene lista de ingredientes
 */
export async function getIngredientes(params?: {
  skip?: number;
  limit?: number;
}): Promise<Ingrediente[]> {
  try {
    const response = await axiosClient.get<
      Ingrediente[] | IngredientesListResponse
    >(INVENTARIO_ENDPOINTS.GET_INGREDIENTES, { params });

    return normalizeListResponse<Ingrediente>(response.data);
  } catch (error) {
    const message = extractErrorMessage(error);
    const err = new Error(`Error al obtener ingredientes: ${message}`);
    (err as any).status = (error as any)?.status;
    throw err;
  }
}

/**
 * Get Ingrediente by ID - Obtiene un ingrediente específico
 */
export async function getIngredienteById(
  ingredienteId: string
): Promise<Ingrediente> {
  try {
    const response = await axiosClient.get<Ingrediente>(
      INVENTARIO_ENDPOINTS.GET_INGREDIENTE_BY_ID(ingredienteId)
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    const err = new Error(`Error al obtener ingrediente: ${message}`);
    (err as any).status = (error as any)?.status;
    throw err;
  }
}

/**
 * Create Ingrediente - Crea un nuevo ingrediente
 */
export async function createIngrediente(
  ingredienteData: CreateIngredienteRequest
): Promise<Ingrediente> {
  try {
    const response = await axiosClient.post<Ingrediente>(
      INVENTARIO_ENDPOINTS.CREATE_INGREDIENTE,
      ingredienteData
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    const err = new Error(`Error al crear ingrediente: ${message}`);
    (err as any).status = (error as any)?.status;
    throw err;
  }
}

/**
 * Update Ingrediente - Actualiza un ingrediente existente
 */
export async function updateIngrediente(
  ingredienteId: string,
  updateData: UpdateIngredienteRequest
): Promise<Ingrediente> {
  try {
    const response = await axiosClient.put<Ingrediente>(
      INVENTARIO_ENDPOINTS.UPDATE_INGREDIENTE(ingredienteId),
      updateData
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    const err = new Error(`Error al actualizar ingrediente: ${message}`);
    (err as any).status = (error as any)?.status;
    throw err;
  }
}

/**
 * Get Movimientos - Obtiene list de movimientos de inventario
 */
export async function getMovimientos(params?: {
  skip?: number;
  limit?: number;
  ingrediente_id?: string;
  tipo_movimiento?: string;
  desde?: string;
  hasta?: string;
}): Promise<MovimientoInventario[]> {
  try {
    const response = await axiosClient.get<
      MovimientoInventario[] | MovimientosListResponse
    >(INVENTARIO_ENDPOINTS.GET_MOVIMIENTOS, { params });

    return normalizeListResponse<MovimientoInventario>(response.data);
  } catch (error) {
    const message = extractErrorMessage(error);
    const err = new Error(`Error al obtener movimientos: ${message}`);
    (err as any).status = (error as any)?.status;
    throw err;
  }
}

/**
 * Create Movimiento - Registra un movimiento de inventario
 */
export async function createMovimiento(
  movimientoData: CreateMovimientoRequest
): Promise<MovimientoInventario> {
  try {
    const response = await axiosClient.post<MovimientoInventario>(
      INVENTARIO_ENDPOINTS.CREATE_MOVIMIENTO,
      movimientoData
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    const err = new Error(`Error al registrar movimiento: ${message}`);
    (err as any).status = (error as any)?.status;
    throw err;
  }
}

/**
 * Descontar Stock - Descuenta stock para múltiples ingredientes (transaccional)
 * Usado cuando se crea una orden
 */
export async function descontarStock(
  request: DescontarStockRequest
): Promise<DescontarStockResponse> {
  try {
    const response = await axiosClient.post<DescontarStockResponse>(
      INVENTARIO_ENDPOINTS.DESCONTAR_STOCK,
      request
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    const err = new Error(`Error al descontar stock: ${message}`);
    (err as any).status = (error as any)?.status;
    throw err;
  }
}
