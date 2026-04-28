import { QueryClient } from "@tanstack/react-query";
import { exponentialBackoffDelay } from "@/services/httpClient/utils";

/**
 * Crea una instancia de QueryClient configurada globalmente
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          const status = error?.status;
          if (status === 401 || status === 403 || status === 404 || status === 429) {
            return false;
          }
          return failureCount < 1;
        },

        retryDelay: (attemptIndex) => exponentialBackoffDelay(attemptIndex),

        staleTime: 5 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },

      mutations: {
        retry: (failureCount, error: any) => {
          const status = error?.status;
          if (status === 400 || status === 409 || status === 429) {
            return false;
          }
          return failureCount < 1;
        },

        retryDelay: (attemptIndex) => exponentialBackoffDelay(attemptIndex),
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
