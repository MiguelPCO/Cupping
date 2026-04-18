"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[AuthError]", error);
  }, [error]);

  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <h2 className="font-display text-xl text-espresso mb-2">
        Error al cargar
      </h2>
      <p className="text-espresso/60 text-sm mb-4">
        Ocurrió un problema. Por favor, inténtalo de nuevo.
      </p>
      <button
        onClick={reset}
        className="text-sm text-copper-600 hover:text-copper-700 underline underline-offset-4"
      >
        Reintentar
      </button>
    </div>
  );
}
