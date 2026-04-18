"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Github } from "lucide-react";
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

type OAuthProvider = "google" | "github";
type AuthMode = "signin" | "signup";

export function LoginForm() {
  const router = useRouter();

  // OAuth
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  // Email/password
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isAnyLoading = oauthLoading !== null || emailLoading;

  // ── OAuth ──────────────────────────────────────────────
  const handleOAuth = async (provider: OAuthProvider) => {
    setOauthLoading(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // browser redirects — loading state stays until navigation
  };

  // ── Email / Password ───────────────────────────────────
  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setEmailLoading(true);

    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setFeedback({ type: "error", text: error.message });
      } else {
        setFeedback({
          type: "success",
          text: "Revisa tu email para confirmar tu cuenta.",
        });
      }
      setEmailLoading(false);
      return;
    }

    // Sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setFeedback({
        type: "error",
        text:
          error.message === "Invalid login credentials"
            ? "Email o contraseña incorrectos."
            : error.message,
      });
      setEmailLoading(false);
      return;
    }

    // Full reload so server components pick up the new session
    router.refresh();
    router.push("/dashboard");
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center pb-2">
        <CardTitle className="font-display text-4xl tracking-tight">
          CUPPING
        </CardTitle>
        <CardDescription className="text-base">
          Tu ritual de café, documentado
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* OAuth providers */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => handleOAuth("google")}
            disabled={isAnyLoading}
          >
            <GoogleIcon />
            {oauthLoading === "google"
              ? "Conectando…"
              : "Continuar con Google"}
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => handleOAuth("github")}
            disabled={isAnyLoading}
          >
            <Github className="size-4" />
            {oauthLoading === "github"
              ? "Conectando…"
              : "Continuar con GitHub"}
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-parchment" />
          <span className="text-xs text-parchment">o</span>
          <div className="flex-1 border-t border-parchment" />
        </div>

        {/* Email / password form */}
        <form onSubmit={handleEmail} className="space-y-3">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isAnyLoading}
            />
            <Input
              type="password"
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              disabled={isAnyLoading}
            />
          </div>

          {feedback && (
            <p
              className={cn(
                "text-xs rounded-lg px-3 py-2",
                feedback.type === "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-700"
              )}
            >
              {feedback.text}
            </p>
          )}

          <Button
            type="submit"
            disabled={isAnyLoading}
            className="w-full bg-copper-500 hover:bg-copper-600 text-white border-0 disabled:opacity-60"
          >
            {emailLoading
              ? "Un momento…"
              : mode === "signin"
                ? "Iniciar sesión"
                : "Crear cuenta"}
          </Button>
        </form>

        {/* Toggle sign-in / sign-up */}
        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "signin" ? "signup" : "signin"));
            setFeedback(null);
          }}
          className="w-full text-center text-xs text-espresso-light hover:text-espresso transition-colors"
        >
          {mode === "signin"
            ? "¿No tienes cuenta? Crear cuenta"
            : "¿Ya tienes cuenta? Iniciar sesión"}
        </button>

        <p className="text-center text-xs text-parchment">
          Al continuar aceptas nuestros términos de servicio
        </p>
      </CardContent>
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
