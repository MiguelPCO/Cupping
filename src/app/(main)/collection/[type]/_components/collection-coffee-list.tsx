"use client";

import { useState } from "react";
import { EmptyState } from "@/components/coffee";
import { useUIStore } from "@/lib/stores";
import { Coffee } from "lucide-react";
import { CollectionCoffeeCard, type OtherCollection } from "./collection-coffee-card";

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
  collectionId: string;
  entryIdMap: Record<string, string>;
  otherCollections: OtherCollection[];
}

export function CollectionCoffeeList({
  coffees,
  collectionLabel,
  collectionId,
  entryIdMap,
  otherCollections,
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
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Buscar en ${collectionLabel}…`}
          aria-label="Buscar en colección"
          className="w-full h-10 px-0 rounded-none border-0 border-b border-parchment bg-transparent text-sm text-espresso placeholder:text-parchment focus:outline-none focus:border-copper-500 transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Coffee}
          title={coffees.length === 0 ? "Colección vacía" : "Sin resultados"}
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
            <CollectionCoffeeCard
              key={coffee.id}
              id={coffee.id}
              name={coffee.name}
              brand={coffee.brand}
              avg_rating={coffee.avg_rating}
              collectionId={collectionId}
              entryId={entryIdMap[coffee.id]}
              otherCollections={otherCollections}
            />
          ))}
        </div>
      )}
    </div>
  );
}
