"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          background: "oklch(0.96 0.02 80)",
          fontFamily: "'Outfit', system-ui, sans-serif",
          margin: 0,
        }}
      >
        <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "oklch(0.55 0.18 25 / 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="oklch(0.55 0.18 25)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "1.5rem",
              color: "oklch(0.22 0.04 50)",
              marginBottom: "0.5rem",
            }}
          >
            Algo salió mal
          </h1>
          <p
            style={{
              color: "oklch(0.45 0.04 50)",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
            }}
          >
            Ocurrió un error inesperado. Por favor, inténtalo de nuevo.
          </p>
          <button
            onClick={reset}
            style={{
              background: "oklch(0.55 0.12 55)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.5rem 1.5rem",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
