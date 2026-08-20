import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de servicio",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/login"
          className="text-sm text-espresso-light hover:text-espresso transition-colors"
        >
          ← Volver
        </Link>

        <h1 className="font-display text-3xl text-espresso mt-6 mb-8">
          Términos de servicio
        </h1>

        <div className="space-y-6 text-sm text-espresso-light leading-relaxed">
          <p>
            CUPPING es un proyecto personal para catalogar y calificar cafés.
            Al usar la app, aceptas que es de uso informal y se ofrece tal
            cual, sin garantías de disponibilidad o continuidad del servicio.
          </p>
          <p>
            Los datos que introduces (perfil, catas, colecciones) se
            almacenan mediante Supabase. Eres responsable del contenido que
            publiques, incluyendo lo que compartas públicamente con otros
            usuarios.
          </p>
          <p>
            No compartimos tus datos con terceros salvo lo necesario para
            operar el servicio (infraestructura de Supabase y Vercel).
          </p>
          <p>
            Puedes solicitar la eliminación de tu cuenta y tus datos en
            cualquier momento contactando al responsable del proyecto.
          </p>
        </div>
      </div>
    </div>
  );
}
