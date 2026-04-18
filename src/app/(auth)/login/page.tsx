import type { Metadata } from "next";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión en CUPPING para registrar y descubrir cafés.",
};

export default function LoginPage() {
  return <LoginForm />;
}
