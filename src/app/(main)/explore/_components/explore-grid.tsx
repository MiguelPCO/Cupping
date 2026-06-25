"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, Coffee as CoffeeIcon } from "lucide-react";
import { CoffeeCommunityCard } from "@/components/coffee/coffee-community-card";
import { cn, getCoffeeTypeLabel, getRoastLabel } from "@/lib/utils";
import { COFFEE_TYPES, ROAST_LEVELS } from "@/types/coffee";
import type { Coffee, CoffeeType, RoastLevel } from "@/types/coffee";

type SortOption = "rating" | "recent";

interface ExploreGridProps {
  coffees: Coffee[];
  reviewedCoffeeIds?: string[];
}

export function ExploreGrid({ coffees, reviewedCoffeeIds = [] }: ExploreGridProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<CoffeeType | null>(null);
  const [roast, setRoast] = useState<RoastLevel | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [showFilters, setShowFilters] = useState(false);

  const reviewedSet = useMemo(() => new Set(reviewedCoffeeIds), [reviewedCoffeeIds]);

  const activeFilterCount = (type ? 1 : 0) + (roast ? 1 : 0);

  const filtered = useMemo(() => {
    const result = coffees.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.brand.toLowerCase().includes(q)) return false;
      }
      if (type && c.type !== type) return false;
      if (roast && c.roast_level !== roast) return false;
      return true;
    });

    if (sortBy === "rating") {
      return [...result].sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
    }
    return [...result].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [coffees, search, type, roast, sortBy]);

  const hasFilters = search || type || roast;

  return (
    <div>
      {/* Single filter bar */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-parchment pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o marca…"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-parchment bg-card text-sm text-espresso placeholder:text-parchment focus:outline-none focus:ring-2 focus:ring-copper-300"
          />
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className={cn(
            "flex items-center gap-1.5 h-10 px-4 rounded-xl border text-sm font-medium transition-colors shrink-0",
            showFilters || activeFilterCount > 0
              ? "bg-espresso text-white border-espresso"
              : "bg-card text-espresso-light border-parchment hover:border-copper-300"
          )}
        >
          <SlidersHorizontal className="size-4" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center size-4 rounded-full bg-copper-300 text-espresso text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
          {showFilters ? <ChevronUp className="size-3.5 ml-0.5" /> : <ChevronDown className="size-3.5 ml-0.5" />}
        </button>

        {/* Sort toggle */}
        <div className="flex rounded-xl border border-parchment overflow-hidden shrink-0 bg-card">
          <button
            onClick={() => setSortBy("rating")}
            className={cn(
              "px-3.5 h-10 text-sm font-medium transition-colors",
              sortBy === "rating"
                ? "bg-espresso text-white"
                : "text-espresso-light hover:text-espresso"
            )}
          >
            Mejor valorados
          </button>
          <button
            onClick={() => setSortBy("recent")}
            className={cn(
              "px-3.5 h-10 text-sm font-medium border-l border-parchment transition-colors",
              sortBy === "recent"
                ? "bg-espresso text-white"
                : "text-espresso-light hover:text-espresso"
            )}
          >
            Más recientes
          </button>
        </div>
      </div>

      {/* Collapsible filter pills */}
      {showFilters && (
        <div className="bg-card rounded-xl border border-parchment p-4 mb-4 space-y-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-copper-400 mb-2">
              Tipo
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COFFEE_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(type === t ? null : t)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                    type === t
                      ? "bg-copper-500 text-white border-copper-500"
                      : "bg-cream text-espresso-light border-parchment hover:border-copper-300"
                  )}
                >
                  {getCoffeeTypeLabel(t)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-copper-400 mb-2">
              Tueste
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ROAST_LEVELS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRoast(roast === r ? null : r)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                    roast === r
                      ? "bg-espresso text-white border-espresso"
                      : "bg-cream text-espresso-light border-parchment hover:border-copper-300"
                  )}
                >
                  {getRoastLabel(r)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count + clear */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-parchment">
          {filtered.length} café{filtered.length !== 1 ? "s" : ""}
          {hasFilters && ` de ${coffees.length}`}
        </p>
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setType(null); setRoast(null); }}
            className="flex items-center gap-1 text-xs text-copper-600 hover:text-copper-700"
          >
            <X className="size-3" />
            Limpiar filtros
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <CoffeeIcon className="size-10 text-parchment mx-auto mb-4" />
          <p className="font-display text-xl text-espresso mb-1">
            {coffees.length === 0 ? "Aún no hay cafés en la comunidad" : "Sin resultados"}
          </p>
          <p className="text-espresso-light text-sm">
            {coffees.length === 0
              ? "¡Sé el primero en añadir una reseña!"
              : "Prueba con otros filtros o términos."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((coffee) => (
            <CoffeeCommunityCard
              key={coffee.id}
              coffee={coffee}
              isReviewed={reviewedSet.has(coffee.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
