import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getCoffeeCatalog,
  getTrendingCoffees,
  getTopRatedCoffees,
  getDistinctOrigins,
  getCoffeesByOrigin,
  getUserReviewedCoffeeIds,
} from "@/lib/supabase/queries";
import { ExploreGrid } from "./_components/explore-grid";
import { ExploreSection } from "./_components/explore-section";
import type { Coffee } from "@/types/coffee";

export const metadata: Metadata = {
  title: "Explorar — CUPPING",
  description: "Descubre los cafés mejor valorados de la comunidad",
};

export default async function ExplorePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Parallel fetch: editorial data + user's reviewed IDs + full catalog
  const [coffees, trending, topRated, origins, reviewedIds] = await Promise.all([
    getCoffeeCatalog(supabase, { pageSize: 100 }),
    getTrendingCoffees(supabase, 6),
    getTopRatedCoffees(supabase, 3, 9),
    getDistinctOrigins(supabase, 1),
    user
      ? getUserReviewedCoffeeIds(supabase, user.id)
      : Promise.resolve<string[]>([]),
  ]);

  // Fetch by-origin sections for top 3 origins (sequential is fine — 3 requests)
  const originSections = await Promise.all(
    origins.slice(0, 3).map(async (origin) => ({
      origin,
      coffees: await getCoffeesByOrigin(supabase, origin, 6),
    }))
  );

  const hasEditorial =
    trending.length > 0 ||
    topRated.length > 0 ||
    originSections.some((s) => s.coffees.length > 0);

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-espresso">Explorar</h1>
        <p className="text-espresso-light text-sm mt-1">
          Cafés de la comunidad
        </p>
      </div>

      {/* Editorial sections */}
      {hasEditorial && (
        <div className="mb-6">
          <ExploreSection
            title="En tendencia"
            coffees={trending}
            reviewedIds={reviewedIds}
          />
          <ExploreSection
            title="Mejor valorados"
            coffees={topRated}
            reviewedIds={reviewedIds}
          />
          {originSections.map(
            ({ origin, coffees: ocs }) =>
              ocs.length > 0 && (
                <ExploreSection
                  key={origin}
                  title={`De ${origin}`}
                  coffees={ocs}
                  reviewedIds={reviewedIds}
                />
              )
          )}
          <hr className="border-parchment mb-6" />
        </div>
      )}

      {/* Full searchable + filterable grid */}
      <h2 className="font-display text-xl text-espresso mb-4">Todos los cafés</h2>
      <ExploreGrid
        coffees={coffees as Coffee[]}
        reviewedCoffeeIds={reviewedIds}
      />
    </div>
  );
}
