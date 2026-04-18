import Link from "next/link";
import { Coffee } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center">
      <div className="size-16 rounded-full bg-parchment flex items-center justify-center mb-6">
        <Coffee className="size-8 text-espresso/40" />
      </div>
      <h1 className="font-display text-4xl text-espresso mb-2">404</h1>
      <p className="font-display text-xl text-espresso mb-1">
        Página no encontrada
      </p>
      <p className="text-espresso/60 text-sm mb-8 max-w-sm">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-lg bg-copper-500 hover:bg-copper-600 text-white text-sm font-medium px-5 py-2.5 transition-colors"
      >
        Ir al inicio
      </Link>
    </div>
  );
}
