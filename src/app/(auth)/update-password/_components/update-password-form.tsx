"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (password !== confirmPassword) {
      setFeedback({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setFeedback({ type: "error", text: error.message });
        return;
      }

      setDone(true);
      setFeedback({
        type: "success",
        text: "Contraseña actualizada. Redirigiendo…",
      });
      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center pb-2">
        <CardTitle className="font-display text-4xl tracking-tight">
          CUPPING
        </CardTitle>
        <CardDescription className="text-base">
          Elige tu nueva contraseña
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="new-password" className="sr-only">
              Nueva contraseña
            </label>
            <Input
              id="new-password"
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={loading || done}
            />
            <label htmlFor="confirm-password" className="sr-only">
              Confirmar contraseña
            </label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={loading || done}
            />
            <p className="text-xs text-hint-text">Mínimo 6 caracteres</p>
          </div>

          {feedback && (
            <p
              role="status"
              aria-live="polite"
              className={cn(
                "text-xs rounded-lg px-3 py-2",
                feedback.type === "error"
                  ? "bg-error/10 text-error"
                  : "bg-success/10 text-success"
              )}
            >
              {feedback.text}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || done}
            className="w-full bg-copper-500 hover:bg-copper-600 text-white border-0 disabled:opacity-60"
          >
            {loading ? "Actualizando…" : "Actualizar contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
