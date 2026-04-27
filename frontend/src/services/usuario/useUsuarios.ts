/**
 * Usuarios Hooks
 * React Query hooks para gestión de usuarios
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsuarios,
  getUsuarioById,
  updateUserRoles,
  deleteUser,
  createUser,
} from "@/services/usuario/usuarioService";
import {
  Usuario,
  UpdateUserRolesRequest,
  CreateUserRequest,
} from "@/shared/types/api";
import { QUERY_KEYS, CACHE_DURATION } from "@/shared/constants/api";

/**
 * useUsuarios - Query para obtener lista de usuarios
 */
export function useUsuarios(params?: {
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.usuarios.lists(),
    queryFn: () => getUsuarios(params),
    staleTime: CACHE_DURATION.MEDIUM,
    gcTime: CACHE_DURATION.LONG,
    retry: 2,
  });
}

/**
 * useUsuarioById - Query para obtener un usuario específico
 */
export function useUsuarioById(usuarioId: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.usuarios.detail(usuarioId || ""),
    queryFn: () => getUsuarioById(usuarioId!),
    enabled: !!usuarioId, // Solo hacer query si hay ID
    staleTime: CACHE_DURATION.MEDIUM,
    gcTime: CACHE_DURATION.LONG,
    retry: 2,
  });
}

/**
 * useUpdateUserRoles - Mutation para actualizar roles de usuario
 */
export function useUpdateUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      usuarioId,
      roleIds,
    }: {
      usuarioId: string;
      roleIds: string[];
    }) => updateUserRoles(usuarioId, roleIds),
    onSuccess: (updatedUsuario) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.usuarios.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.usuarios.detail(updatedUsuario.id),
      });
    },
    onError: (error: Error) => {
      console.error("Error actualizando roles:", error.message);
    },
  });
}

/**
 * useDeleteUser - Mutation para eliminar usuario
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usuarioId: string) => deleteUser(usuarioId),
    onSuccess: () => {
      // Invalida queries de usuarios
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.usuarios.lists(),
      });
    },
    onError: (error: Error) => {
      console.error("Error eliminando usuario:", error.message);
    },
  });
}

/**
 * useCreateUser - Mutation para crear nuevo usuario
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => createUser(userData),
    onSuccess: (newUsuario) => {
      // Invalida queries de usuarios para que se recargen
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.usuarios.lists(),
      });
    },
    onError: (error: Error) => {
      console.error("Error creando usuario:", error.message);
    },
  });
}
