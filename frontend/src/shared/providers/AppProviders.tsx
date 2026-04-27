"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { createQueryClient } from "../lib/queryClient";
import { hydrateAuthStore } from "../store/authStore";
import { ErrorBoundary } from "../components/ErrorBoundary";

type AppProvidersProps = {
  children: ReactNode;
};

/**
 * AppProviders - Envuelve la app con todos los providers necesarios
 * - QueryClientProvider: gestiona caché y queries
 * - ErrorBoundary: captura errores de React
 * - Auth hydration: carga sesión desde localStorage
 */
export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());
  const [isHydrated, setIsHydrated] = useState(false);

  // Hidrata el store de autenticación al montar
  useEffect(() => {
    hydrateAuthStore();
    setIsHydrated(true);
  }, []);

  // Previene flash de contenido no autenticado
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </QueryClientProvider>
  );
}
