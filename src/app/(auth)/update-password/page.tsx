import type { Metadata } from "next";
import { UpdatePasswordForm } from "./_components/update-password-form";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  description: "Establece una nueva contraseña para tu cuenta de CUPPING.",
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
