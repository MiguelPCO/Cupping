"use client";

import { Coffee } from "lucide-react";
import { CoffeeCard, EmptyState } from "@/components/coffee";
import { SearchBar, FilterSidebar, FilterTrigger } from "@/components/search";
import { useFilteredEntries } from "@/lib/hooks";
import { useUIStore } from "@/lib/stores";
import type { CoffeeEntryWithCoffee } from "@/types/coffee";

interface FilteredEntryGridProps {
  entries: CoffeeEntryWithCoffee[];
  userId: string;
}

export function FilteredEntryGrid({ entries, userId }: FilteredEntryGridProps) {
  const { setAddCoffeeModal } = useUIStore();
  const filtered = useFilteredEntries(entries);

  return (
    <div>
      {/* Search + mobile filter trigger */}
      <div className="flex gap-2 mb-5">
        <SearchBar className="flex-1" />
        <FilterTrigger />
      </div>

      <div className="flex gap-6 items-start">
        {/* Desktop filter sidebar */}
        <FilterSidebar />

        {/* Results */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Coffee}
              title={
                entries.length === 0 ? "Sin reseñas todavía" : "Sin resultados"
              }
              description={
                entries.length === 0
                  ? "Registra tu primer café para empezar."
                  : "Prueba con otros filtros o términos de búsqueda."
              }
              action={
                entries.length === 0
                  ? {
                      label: "Añadir café",
                      onClick: () => setAddCoffeeModal(true),
                    }
                  : undefined
              }
            />
          ) : (
            <>
              <p className="text-xs text-parchment mb-3">
                {filtered.length} reseña{filtered.length !== 1 ? "s" : ""}
                {filtered.length !== entries.length &&
                  ` de ${entries.length}`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((entry) => (
                  <CoffeeCard
                    key={entry.id}
                    entry={entry}
                    currentUserId={userId}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
