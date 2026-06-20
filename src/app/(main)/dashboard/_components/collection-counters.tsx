import Link from "next/link";
import type { CollectionType } from "@/types/coffee";

interface CollectionRow {
  id: string;
  type: string;
  name: string;
}

interface CollectionCountersProps {
  collections: CollectionRow[];
  itemCounts: Record<string, number>;
}

const META: Record<CollectionType, { label: string }> = {
  at_home:   { label: "En casa" },
  favorites: { label: "Favoritos" },
  to_try:    { label: "Por probar" },
  tried:     { label: "Probados" },
};

const COLLECTION_TYPES: CollectionType[] = ["at_home", "favorites", "to_try", "tried"];

export function CollectionCounters({
  collections,
  itemCounts,
}: CollectionCountersProps) {
  const byType = Object.fromEntries(collections.map((c) => [c.type, c]));

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-copper-400 mb-3">
        Mi colección
      </p>
      {/* Horizontal scroll on mobile, 4-col on sm+ */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4">
        {COLLECTION_TYPES.map((type) => {
          const col = byType[type];
          const count = col ? (itemCounts[col.id] ?? 0) : 0;
          const { label } = META[type];
          return (
            <Link
              key={type}
              href={`/collection/${type}`}
              className="flex-shrink-0 flex flex-col items-center gap-1 px-5 py-3 bg-card rounded-xl border border-parchment hover:border-copper-300 hover:shadow-sm transition-all min-w-[80px] sm:min-w-0"
            >
              <span className="font-mono text-xl font-semibold text-espresso tabular-nums leading-none">
                {count}
              </span>
              <span className="text-[11px] font-medium text-espresso-light text-center leading-tight">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
