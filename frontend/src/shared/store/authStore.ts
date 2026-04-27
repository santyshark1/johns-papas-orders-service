import { create } from "zustand";
import { Usuario } from "@/shared/types/api";

type AuthState = {
  // Estado
  user: Usuario | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Acciones
  setSession: (user: Usuario, token: string, refreshToken?: string) => void;
  setToken: (token: string, refreshToken?: string) => void;
  clearSession: () => void;
  hydrate: () => void; // Carga datos desde localStorage en startup
};

/**
 * Auth Store
 * Maneja el estado de autenticación con sincronización a localStorage
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // Estado inicial
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,

  /**
   * setSession - Establece usuario y tokens
   * Sincroniza automáticamente con localStorage
   */
  setSession: (user, token, refreshToken) => {
    // Actualiza el store
    set({
      user,
      token,
      refreshToken: refreshToken || null,
      isAuthenticated: true,
    });

    // Sincroniza con localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
    }
  },

  /**
   * setToken - Actualiza solo el token (para refresh)
   */
  setToken: (token, refreshToken) => {
    set({
      token,
      refreshToken: refreshToken || get().refreshToken,
    });

    // Sincroniza con localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
    }
  },

  /**
   * clearSession - Limpia toda la autenticación
   */
  clearSession: () => {
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    });

    // Limpia localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
    }
  },

  /**
   * hydrate - Carga datos desde localStorage en startup
   * Útil para persistencia entre sesiones
   */
  hydrate: () => {
    if (typeof window === "undefined") return;

    try {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (userStr && token) {
        const user = JSON.parse(userStr) as Usuario;
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Error hidratando auth store:", error);
      // Si hay error, limpiar localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
    }
  },
}));

/**
 * Hidrata el store al cargar la aplicación
 * Llamar esto en el layout o app principal
 */
export function hydrateAuthStore() {
  useAuthStore.getState().hydrate();
}
