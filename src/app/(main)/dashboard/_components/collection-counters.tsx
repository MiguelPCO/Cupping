import Link from "next/link";
import { Home, Heart, BookmarkPlus, CheckCircle } from "lucide-react";
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

const META: Record<CollectionType, { label: string; icon: React.ReactNode; color: string }> = {
  at_home: {
    label: "En casa",
    icon: <Home className="size-4" />,
    color: "text-amber-600 bg-amber-50",
  },
  favorites: {
    label: "Favoritos",
    icon: <Heart className="size-4" />,
    color: "text-red-500 bg-red-50",
  },
  to_try: {
    label: "Por probar",
    icon: <BookmarkPlus className="size-4" />,
    color: "text-blue-500 bg-blue-50",
  },
  tried: {
    label: "Probados",
    icon: <CheckCircle className="size-4" />,
    color: "text-green-600 bg-green-50",
  },
};

const COLLECTION_TYPES: CollectionType[] = ["at_home", "favorites", "to_try", "tried"];

export function CollectionCounters({
  collections,
  itemCounts,
}: CollectionCountersProps) {
  const byType = Object.fromEntries(collections.map((c) => [c.type, c]));

  return (
    <div>
      <h3 className="text-sm font-medium text-espresso mb-3">Mi colección</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {COLLECTION_TYPES.map((type) => {
          const col = byType[type];
          const count = col ? (itemCounts[col.id] ?? 0) : 0;
          const { label, icon, color } = META[type];
          return (
            <Link
              key={type}
              href={`/collection/${type}`}
              className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-parchment hover:border-copper-300 hover:shadow-sm transition-all"
            >
              <div
                className={`flex items-center justify-center size-8 rounded-full shrink-0 ${color}`}
              >
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-espresso-light truncate">{label}</p>
                <p className="font-mono text-lg font-semibold text-espresso leading-tight">
                  {count}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
