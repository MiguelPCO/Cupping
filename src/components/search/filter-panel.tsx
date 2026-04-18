"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useFilterStore } from "@/lib/stores";
import { COFFEE_TYPES, ROAST_LEVELS, FLAVOR_TAGS } from "@/types/coffee";
import type { FlavorTag } from "@/types/coffee";
import {
  getCoffeeTypeLabel,
  getRoastLabel,
  cn,
} from "@/lib/utils";
import { RatingCups } from "@/components/coffee";
import { FlavorTag as FlavorTagChip } from "@/components/coffee";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

const ROAST_BG: Record<string, string> = {
  light: "bg-roast-light",
  medium: "bg-roast-medium",
  medium_dark: "bg-roast-medium-dark",
  dark: "bg-roast-dark",
};

const SORT_OPTIONS = [
  { value: "date", label: "Fecha" },
  { value: "rating", label: "Rating" },
  { value: "name", label: "Nombre" },
] as const;

function useActiveFilterCount() {
  const { coffeeType, roastLevel, minRating, flavorTags } = useFilterStore();
  return (
    (coffeeType ? 1 : 0) +
    (roastLevel ? 1 : 0) +
    (minRating !== null ? 1 : 0) +
    flavorTags.length
  );
}

// ── Shared filter content ─────────────────────────────────

function FilterContent({ compact = false }: { compact?: boolean }) {
  const {
    coffeeType,
    setCoffeeType,
    roastLevel,
    setRoastLevel,
    minRating,
    setMinRating,
    flavorTags,
    toggleFlavorTag,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetFilters,
  } = useFilterStore();

  const activeCount = useActiveFilterCount();

  return (
    <div className={cn("space-y-5", compact && "space-y-4")}>
      {/* Type */}
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-parchment mb-2">
          Tipo
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCoffeeType(null)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
              coffeeType === null
                ? "bg-copper-500 text-white border-copper-500"
                : "bg-white text-espresso-light border-parchment hover:border-copper-300"
            )}
          >
            Todos
          </button>
          {COFFEE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCoffeeType(coffeeType === type ? null : type)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                coffeeType === type
                  ? "bg-copper-500 text-white border-copper-500"
                  : "bg-white text-espresso-light border-parchment hover:border-copper-300"
              )}
            >
              {getCoffeeTypeLabel(type)}
            </button>
          ))}
        </div>
      </section>

      {/* Roast */}
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-parchment mb-2">
          Tueste
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setRoastLevel(null)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
              roastLevel === null
                ? "bg-espresso text-white border-espresso"
                : "bg-white text-espresso-light border-parchment hover:border-espresso/30"
            )}
          >
            Todos
          </button>
          {ROAST_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setRoastLevel(roastLevel === level ? null : level)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium text-white transition-all",
                ROAST_BG[level],
                roastLevel === level
                  ? "ring-2 ring-offset-1 ring-espresso/40 scale-105"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              {getRoastLabel(level)}
            </button>
          ))}
        </div>
      </section>

      {/* Min rating */}
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-parchment mb-2">
          Rating mínimo
        </p>
        <div className="flex items-center gap-3">
          <RatingCups
            value={minRating ?? 0}
            onChange={(v) => setMinRating(minRating === v ? null : v)}
            size="sm"
            showValue={false}
          />
          {minRating !== null && (
            <span className="text-xs text-copper-600 font-mono">
              ≥ {minRating.toFixed(1)}
            </span>
          )}
        </div>
      </section>

      {/* Flavor tags */}
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-parchment mb-2">
          Notas de sabor
        </p>
        <div className="flex flex-wrap gap-1.5">
          {FLAVOR_TAGS.map((tag) => (
            <FlavorTagChip
              key={tag}
              flavor={tag as FlavorTag}
              selected={flavorTags.includes(tag as FlavorTag)}
              onToggle={toggleFlavorTag}
              size="sm"
            />
          ))}
        </div>
      </section>

      {/* Sort */}
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-parchment mb-2">
          Ordenar por
        </p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {SORT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSortBy(value)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                  sortBy === value
                    ? "bg-copper-500 text-white border-copper-500"
                    : "bg-white text-espresso-light border-parchment hover:border-copper-300"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            aria-label={sortOrder === "asc" ? "Orden ascendente" : "Orden descendente"}
            className="flex items-center justify-center size-7 rounded-md border border-parchment hover:border-copper-300 text-espresso-light hover:text-espresso transition-colors"
          >
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                sortOrder === "asc" && "rotate-180"
              )}
            />
          </button>
        </div>
      </section>

      {/* Reset */}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs text-copper-600 hover:text-copper-700 font-medium underline underline-offset-2"
        >
          Limpiar {activeCount} filtro{activeCount !== 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}

// ── Desktop sidebar (always visible on sm+) ───────────────

export function FilterSidebar() {
  return (
    <aside className="hidden sm:block w-52 shrink-0">
      <FilterContent />
    </aside>
  );
}

// ── Mobile trigger + Sheet ────────────────────────────────

export function FilterTrigger() {
  const activeCount = useActiveFilterCount();

  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          "sm:hidden inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border text-sm font-medium transition-colors shrink-0",
          activeCount > 0
            ? "border-copper-500 text-copper-600 bg-copper-50"
            : "border-parchment text-espresso-light hover:border-copper-300"
        )}
        aria-label="Abrir filtros"
      >
        <SlidersHorizontal className="size-4" />
        Filtrar
        {activeCount > 0 && (
          <span className="flex items-center justify-center size-4 rounded-full bg-copper-500 text-white text-[10px] font-medium">
            {activeCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="pb-2">
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-2">
          <FilterContent />
        </div>
        <SheetFooter className="pt-2">
          <SheetClose
            className="w-full h-10 rounded-lg bg-copper-500 text-white text-sm font-medium hover:bg-copper-600 transition-colors"
          >
            Ver resultados
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
