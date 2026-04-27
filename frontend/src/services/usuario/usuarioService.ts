/**
 * Usuario Service
 * Handles authentication (login, register, refresh) and user management (CRUD)
 */

import { axiosClient } from "./axiosClient";
import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  Usuario,
  RefreshTokenRequest,
  UpdateUserRolesRequest,
  CreateUserRequest,
  UsuariosListResponse,
} from "@/shared/types/api";
import { USUARIO_ENDPOINTS } from "@/shared/constants/api";
import { extractErrorMessage } from "./utils";

/**
 * Login - Autentifica un usuario
 */
export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  try {
    const response = await axiosClient.post<TokenResponse>(
      USUARIO_ENDPOINTS.LOGIN,
      credentials
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al iniciar sesión: ${message}`);
  }
}

/**
 * Register - Registra un nuevo usuario
 */
export async function register(
  data: RegisterRequest
): Promise<TokenResponse> {
  try {
    const response = await axiosClient.post<TokenResponse>(
      USUARIO_ENDPOINTS.REGISTER,
      data
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al registrarse: ${message}`);
  }
}

/**
 * Refresh Token - Refresca el token de acceso usando el refresh token
 */
export async function refreshToken(
  refreshTokenValue: string
): Promise<TokenResponse> {
  try {
    const payload: RefreshTokenRequest = { refresh_token: refreshTokenValue };
    const response = await axiosClient.post<TokenResponse>(
      USUARIO_ENDPOINTS.REFRESH_TOKEN,
      payload
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al refrescar token: ${message}`);
  }
}

/**
 * Get Users - Obtiene lista de usuarios
 */
export async function getUsuarios(params?: {
  skip?: number;
  limit?: number;
}): Promise<Usuario[]> {
  try {
    const response = await axiosClient.get<Usuario[] | UsuariosListResponse>(
      USUARIO_ENDPOINTS.GET_USERS,
      { params }
    );

    // Maneja respuesta como array o como objeto con items
    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (response.data && "items" in response.data) {
      return response.data.items;
    }

    return [];
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al obtener usuarios: ${message}`);
  }
}

/**
 * Get User by ID - Obtiene un usuario específico
 */
export async function getUsuarioById(usuarioId: string): Promise<Usuario> {
  try {
    const response = await axiosClient.get<Usuario>(
      USUARIO_ENDPOINTS.GET_USER_BY_ID(usuarioId)
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al obtener usuario: ${message}`);
  }
}

/**
 * Update User Roles - Actualiza los roles de un usuario
 */
export async function updateUserRoles(
  usuarioId: string,
  roleIds: string[]
): Promise<Usuario> {
  try {
    const payload: UpdateUserRolesRequest = { roleIds };
    const response = await axiosClient.put<Usuario>(
      USUARIO_ENDPOINTS.UPDATE_USER_ROLES(usuarioId),
      payload
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al actualizar roles: ${message}`);
  }
}

/**
 * Delete User - Elimina un usuario
 */
export async function deleteUser(usuarioId: string): Promise<void> {
  try {
    await axiosClient.delete(USUARIO_ENDPOINTS.DELETE_USER(usuarioId));
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al eliminar usuario: ${message}`);
  }
}

/**
 * Create User - Crea un nuevo usuario (como admin)
 */
export async function createUser(
  userData: CreateUserRequest
): Promise<Usuario> {
  try {
    // Usa el endpoint de register pero con formato de admin
    const response = await axiosClient.post<Usuario>(
      USUARIO_ENDPOINTS.GET_USERS,
      userData
    );
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    throw new Error(`Error al crear usuario: ${message}`);
  }
}
