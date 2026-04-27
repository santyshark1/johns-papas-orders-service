import { QueryClient } from "@tanstack/react-query";
import { exponentialBackoffDelay } from "@/services/httpClient/utils";

/**
 * Crea una instancia de QueryClient configurada globalmente
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Retry strategy con exponential backoff
        retry: (failureCount, error: any) => {
          // No reintentar si es error de autenticación
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }

          // Reintentar máximo 3 veces
          return failureCount < 3;
        },

        retryDelay: (attemptIndex) => {
          return exponentialBackoffDelay(attemptIndex);
        },

        // Datos frescos por 5 minutos por defecto
        staleTime: 5 * 60 * 1000,

        // Mantener datos en caché por 1 hora
        gcTime: 60 * 60 * 1000, // antes conocido como cacheTime

        // No refetch al cambiar de pestaña
        refetchOnWindowFocus: false,

        // No refetch al reconectar
        refetchOnReconnect: false,

        // No refetch al montar (a menos que esté stale)
        refetchOnMount: false,
      },

      mutations: {
        // Retry de mutaciones máximo 2 veces
        retry: (failureCount, error: any) => {
          // No reintentar errores de validación
          if (error?.status === 400) {
            return false;
          }
          return failureCount < 2;
        },

        retryDelay: (attemptIndex) => {
          return exponentialBackoffDelay(attemptIndex);
        },
      },
    },
  });
}

/**
 * Singleton para la instancia global de QueryClient
 */
let globalQueryClient: QueryClient | null = null;

export function getGlobalQueryClient(): QueryClient {
  if (!globalQueryClient) {
    globalQueryClient = createQueryClient();
  }
  return globalQueryClient;
}
