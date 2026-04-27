/**
 * Auth Hooks
 * React Query hooks para autenticación (login, register, refresh)
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  login as loginService,
  register as registerService,
  refreshToken as refreshTokenService,
} from "@/services/usuario/usuarioService";
import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  Usuario,
} from "@/shared/types/api";
import { useAuthStore } from "@/shared/store/authStore";
import { QUERY_KEYS } from "@/shared/constants/api";
import { useRouter } from "next/navigation";

/**
 * useLogin - Hook para login
 */
export function useLogin() {
  const router = useRouter();
  const { setSession } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await loginService(credentials);
      return response;
    },
    onSuccess: (data: TokenResponse) => {
      // Extraer usuario de la respuesta
      const usuario: Usuario = {
        id: (data as any).user?.id || "",
        nombre: (data as any).user?.nombre || "",
        email: (data as any).user?.email || "",
        roles: (data as any).user?.roles || [],
      };

      // Actualizar store y localStorage
      setSession(usuario, data.access_token, data.refresh_token);

      // Redirigir al dashboard
      router.push("/menu");
    },
    onError: (error: Error) => {
      console.error("Login error:", error.message);
      // El error se maneja en el componente
    },
  });
}

/**
 * useRegister - Hook para registrarse
 */
export function useRegister() {
  const router = useRouter();
  const { setSession } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await registerService(data);
      return response;
    },
    onSuccess: (data: TokenResponse) => {
      // Extraer usuario de la respuesta
      const usuario: Usuario = {
        id: (data as any).user?.id || "",
        nombre: (data as any).user?.nombre || "",
        email: (data as any).user?.email || "",
        roles: (data as any).user?.roles || [],
      };

      // Actualizar store y localStorage
      setSession(usuario, data.access_token, data.refresh_token);

      // Redirigir al dashboard
      router.push("/menu");
    },
    onError: (error: Error) => {
      console.error("Register error:", error.message);
    },
  });
}

/**
 * useRefreshToken - Hook para refrescar token
 */
export function useRefreshToken() {
  const { setToken } = useAuthStore();

  return useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await refreshTokenService(refreshToken);
      return response;
    },
    onSuccess: (data: TokenResponse) => {
      setToken(data.access_token, data.refresh_token);
    },
    onError: (error: Error) => {
      console.error("Token refresh error:", error.message);
      // El interceptor de axiosClient manejará el logout
    },
  });
}

/**
 * useLogout - Hook para logout (no usa API, solo limpia estado)
 */
export function useLogout() {
  const router = useRouter();
  const { clearSession } = useAuthStore();

  return () => {
    clearSession();
    router.push("/login");
  };
}

/**
 * useAuthUser - Hook para obtener el usuario autenticado actual
 */
export function useAuthUser() {
  return useQuery({
    queryKey: QUERY_KEYS.auth.user(),
    queryFn: () => {
      const { user } = useAuthStore.getState();
      return user;
    },
    enabled: false, // Nunca fetch del backend, usa estado local
  });
}

/**
 * useIsAuthenticated - Hook para verificar si está autenticado
 */
export function useIsAuthenticated() {
  const { isAuthenticated, token } = useAuthStore();
  return isAuthenticated && !!token;
}
