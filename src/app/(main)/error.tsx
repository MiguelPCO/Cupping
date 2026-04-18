"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MainError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[MainError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="size-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="size-7 text-destructive" />
      </div>
      <h2 className="font-display text-2xl text-espresso mb-2">
        Algo salió mal
      </h2>
      <p className="text-espresso/60 text-sm mb-6 max-w-sm">
        No pudimos cargar esta página. Por favor, inténtalo de nuevo.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          Volver
        </Button>
        <Button
          onClick={reset}
          className="bg-copper-500 hover:bg-copper-600 text-white border-0"
        >
          Reintentar
        </Button>
      </div>
    </div>
  );
}
