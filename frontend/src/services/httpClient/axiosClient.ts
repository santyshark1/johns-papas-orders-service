import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/shared/store/authStore";
import { USUARIO_ENDPOINTS } from "@/shared/constants/api";
import { extractErrorMessage, isAuthenticationError, isTimeoutError, isNetworkError } from "./utils";

const baseURL = "";

// Flag para prevenir loops infinitos de refresh
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(
  refreshTokenValue: string
): Promise<{ access_token: string; refresh_token: string } | null> {
  try {
    const response = await axios.post(
      USUARIO_ENDPOINTS.REFRESH_TOKEN,
      { refresh_token: refreshTokenValue },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    return response.data as { access_token: string; refresh_token: string };
  } catch {
    return null;
  }
}

export const axiosClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * REQUEST INTERCEPTOR
 * Agrega el token de autenticación a cada request
 */
axiosClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore.getState();
    const tokenFromStore = authStore.token;
    const tokenFromStorage =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const token = tokenFromStore ?? tokenFromStorage;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Maneja errores, refresh de token automático, y extrae mensajes de error
 */
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Log en desarrollo
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
      console.error("[HTTP Error]", {
        status: error.response?.status,
        message: error.message,
        url: originalRequest?.url,
      });
    }

    // Error de autenticación: intenta refrescar el token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      isAuthenticationError(error.response?.data)
    ) {
      originalRequest._retry = true;

      try {
        // Si ya hay un refresh en proceso, espera a que termine
        if (isRefreshing) {
          if (refreshPromise) {
            const newToken = await refreshPromise;
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return axiosClient(originalRequest);
          }
        }

        // Inicia el refresh
        isRefreshing = true;
        const authStore = useAuthStore.getState();
        const refreshTokenValue = authStore.refreshToken ?? localStorage.getItem("refresh_token");

        if (!refreshTokenValue) {
          // No hay refresh token: logout
          authStore.clearSession();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Promesa de refresh para que otros requests esperen
        refreshPromise = (async () => {
          try {
            const response = await refreshAccessToken(refreshTokenValue);

            if (!response) {
              throw new Error("No se pudo refrescar el token");
            }

            const newAccessToken = response.access_token;
            const newRefreshToken = response.refresh_token;

            // Actualiza el store y localStorage
            authStore.setToken(newAccessToken);
            localStorage.setItem("token", newAccessToken);
            localStorage.setItem("refresh_token", newRefreshToken);

            // Actualiza el header del original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            return newAccessToken;
          } catch (refreshError) {
            // Error al refrescar: logout
            authStore.clearSession();
            localStorage.removeItem("token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
            return null;
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        })();

        const newToken = await refreshPromise;
        if (newToken) {
          return axiosClient(originalRequest);
        }
        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Manejo especial para otros errores comunes
    let errorMessage: string;

    if (isNetworkError(error)) {
      errorMessage = "Error de conexión. Por favor verifica tu conexión a internet.";
    } else if (isTimeoutError(error)) {
      errorMessage = "La solicitud tardó demasiado. Por favor intenta de nuevo.";
    } else if (error.response?.status === 403) {
      errorMessage = "No tienes permisos para realizar esta acción.";
    } else if (error.response?.status === 404) {
      errorMessage = "El recurso solicitado no existe.";
    } else if (error.response?.status === 429) {
      errorMessage = "Demasiadas solicitudes. Espera un momento e intenta de nuevo.";
    } else if (error.response?.status === 400) {
      errorMessage = extractErrorMessage(error.response?.data);
    } else if (error.response?.status && error.response.status >= 500) {
      errorMessage = "Error del servidor. Por favor intenta de nuevo más tarde.";
    } else {
      errorMessage = extractErrorMessage(error.response?.data ?? error.message);
    }

    // Crea nuevo error con mensaje descriptivo
    const apiError = new Error(errorMessage);
    (apiError as any).status = error.response?.status;
    (apiError as any).originalError = error;

    return Promise.reject(apiError);
  }
);
