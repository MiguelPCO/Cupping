"use client";

import { useState } from "react";
import { EmptyState, RatingCups } from "@/components/coffee";
import { useUIStore } from "@/lib/stores";
import { Coffee } from "lucide-react";

interface CoffeeItem {
  id: string;
  name: string;
  brand: string;
  avg_rating: number | null;
  added_at: string;
}

interface CollectionCoffeeListProps {
  coffees: CoffeeItem[];
  collectionLabel: string;
}

export function CollectionCoffeeList({
  coffees,
  collectionLabel,
}: CollectionCoffeeListProps) {
  const [search, setSearch] = useState("");
  const { setAddCoffeeModal } = useUIStore();

  const filtered = search
    ? coffees.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.brand.toLowerCase().includes(search.toLowerCase())
      )
    : coffees;

  return (
    <div>
      <div className="mb-5">
        <div className="relative">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Buscar en ${collectionLabel}…`}
            aria-label="Buscar en colección"
            className="w-full h-10 px-0 rounded-none border-0 border-b border-parchment bg-transparent text-sm text-espresso placeholder:text-parchment focus:outline-none focus:border-copper-500 transition-colors"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Coffee}
          title={
            coffees.length === 0 ? "Colección vacía" : "Sin resultados"
          }
          description={
            coffees.length === 0
              ? `Aún no tienes cafés en "${collectionLabel}".`
              : "Prueba con otro término de búsqueda."
          }
          action={
            coffees.length === 0
              ? { label: "Añadir café", onClick: () => setAddCoffeeModal(true) }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((coffee) => (
            <div
              key={coffee.id}
              className="bg-white rounded-xl border border-parchment p-4 hover:shadow-sm transition-shadow"
            >
              <h3 className="font-display text-lg text-espresso truncate">
                {coffee.name}
              </h3>
              <p className="text-xs text-espresso-light mt-0.5 truncate">
                {coffee.brand}
              </p>
              {coffee.avg_rating !== null && (
                <div className="mt-2">
                  <RatingCups value={coffee.avg_rating} readOnly size="sm" showValue />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
