import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getCoffeeCatalog,
  getTrendingWithScore,
  getTopRatedCoffees,
  getCoffeeCountByOrigin,
  getUserReviewedCoffeeIds,
  getActiveBrands,
} from "@/lib/supabase/queries";
import { BrandChips } from "./_components/brand-chips";
import { OriginChips } from "./_components/origin-chips";
import { ExploreGrid } from "./_components/explore-grid";
import { ExploreSection } from "./_components/explore-section";
import { ExploreTabBar } from "./_components/explore-tab-bar";
import { PeopleGrid } from "./_components/people-grid";
import type { Coffee } from "@/types/coffee";

export const metadata: Metadata = {
  title: "Explorar — CUPPING",
  description: "Descubre cafés y personas de la comunidad",
};

interface SearchParams {
  tab?: string;
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tab = "cafes" } = await searchParams;

  // ── Personas tab: skip all heavy coffee queries ──
  if (tab === "personas") {
    return (
      <div className="px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-3xl text-espresso">Explorar</h1>
          <p className="text-espresso-light text-sm mt-1">
            Cafés y personas de la comunidad
          </p>
        </div>
        <ExploreTabBar activeTab="personas" />
        <PeopleGrid />
      </div>
    );
  }

  // ── Cafés tab (default) ──
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [coffees, trending, topRated, originCounts, activeBrands, reviewedIds] = await Promise.all([
    getCoffeeCatalog(supabase, { pageSize: 100 }),
    getTrendingWithScore(supabase, 6),
    getTopRatedCoffees(supabase, 3, 9),
    getCoffeeCountByOrigin(supabase),
    getActiveBrands(supabase, 1, 12),
    user
      ? getUserReviewedCoffeeIds(supabase, user.id)
      : Promise.resolve<string[]>([]),
  ]);

  const hasEditorial = trending.length > 0 || topRated.length > 0;

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-espresso">Explorar</h1>
        <p className="text-espresso-light text-sm mt-1">
          Cafés y personas de la comunidad
        </p>
      </div>

      <ExploreTabBar activeTab="cafes" />

      {/* Editorial sections */}
      {hasEditorial && (
        <div className="mb-6">
          <ExploreSection
            title="Tendencias esta semana"
            coffees={trending as unknown as Coffee[]}
            reviewedIds={reviewedIds}
          />
          <ExploreSection
            title="Mejor valorados"
            coffees={topRated}
            reviewedIds={reviewedIds}
          />
          <hr className="border-parchment mb-6" />
        </div>
      )}

      {/* Origin chips */}
      <OriginChips origins={originCounts} />

      {/* Brand chips */}
      <BrandChips brands={activeBrands} />

      {/* Full searchable + filterable grid */}
      <h2 className="font-display text-xl text-espresso mb-4">Todos los cafés</h2>
      <ExploreGrid
        coffees={coffees as Coffee[]}
        reviewedCoffeeIds={reviewedIds}
      />
    </div>
  );
}
