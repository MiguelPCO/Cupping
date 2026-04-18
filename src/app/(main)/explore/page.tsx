import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCoffeeCatalog } from "@/lib/supabase/queries";
import { CoffeeCommunityCard } from "@/components/coffee/coffee-community-card";
import type { Coffee } from "@/types/coffee";

export const metadata: Metadata = {
  title: "Explorar — CUPPING",
  description: "Descubre los cafés mejor valorados de la comunidad",
};

export default async function ExplorePage() {
  const supabase = await createServerSupabaseClient();
  const coffees = await getCoffeeCatalog(supabase, { pageSize: 24 });

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-espresso">Explorar</h1>
        <p className="text-espresso-light text-sm mt-1">
          Cafés de la comunidad, ordenados por valoración
        </p>
      </div>

      {coffees.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-4xl mb-4">☕</p>
          <p className="font-display text-xl text-espresso mb-1">
            Aún no hay cafés en la comunidad
          </p>
          <p className="text-espresso-light text-sm">
            ¡Sé el primero en añadir una reseña!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {coffees.map((coffee) => (
            <CoffeeCommunityCard
              key={coffee.id}
              coffee={coffee as Coffee}
            />
          ))}
        </div>
      )}
    </div>
  );
}
