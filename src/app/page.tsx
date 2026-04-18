import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-6xl text-espresso mb-3 tracking-tight">
        CUPPING
      </h1>
      <p className="text-espresso-light text-lg mb-10 max-w-xs">
        Tu ritual de café, documentado.
      </p>
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all bg-copper-500 hover:bg-copper-600 text-white px-8 h-11"
      >
        Comenzar
      </Link>
    </main>
  );
}
