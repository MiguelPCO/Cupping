import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCoffeeCatalog } from "@/lib/supabase/queries";
import { ExploreGrid } from "./_components/explore-grid";
import type { Coffee } from "@/types/coffee";

export const metadata: Metadata = {
  title: "Explorar — CUPPING",
  description: "Descubre los cafés mejor valorados de la comunidad",
};

export default async function ExplorePage() {
  const supabase = await createServerSupabaseClient();
  const coffees = await getCoffeeCatalog(supabase, { pageSize: 100 });

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-espresso">Explorar</h1>
        <p className="text-espresso-light text-sm mt-1">
          Cafés de la comunidad
        </p>
      </div>
      <ExploreGrid coffees={coffees as Coffee[]} />
    </div>
  );
}
