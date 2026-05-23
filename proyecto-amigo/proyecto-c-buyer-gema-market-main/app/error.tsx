"use client";

import React, { useEffect } from "react";
import { Button, EmptyState } from "./components/ui";

/**
 * Error boundary global de la aplicación.
 * Captura errores inesperados en Server Components o Client Components.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Loggear el error a un servicio externo (Sentry, LogRocket, etc.)
    console.error("Global Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6">
      <EmptyState
        icon="alertCircle"
        title="¡Ups! Algo salió mal"
        body="Hubo un problema al cargar esta sección. Por favor, intenta de nuevo o vuelve al inicio."
        action={
          <div className="flex flex-col gap-3 w-full">
            <Button variant="primary" full onClick={() => reset()}>
              Reintentar
            </Button>
            <Button
              variant="ghost"
              full
              onClick={() => (window.location.href = "/")}
            >
              Volver al inicio
            </Button>
          </div>
        }
      />
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 max-w-lg overflow-auto rounded-r2 bg-bone p-4 text-left">
          <p className="mb-2 text-xs font-bold text-danger">Debug Info:</p>
          <pre className="text-[10px] text-ink-2">
            {error.message || "Error desconocido"}
          </pre>
        </div>
      )}
    </div>
  );
}
