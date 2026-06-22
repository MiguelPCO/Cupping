import Link from "next/link";

interface OriginChipsProps {
  origins: { origin: string; count: number }[];
  activeOrigin?: string;
}

export function OriginChips({ origins, activeOrigin }: OriginChipsProps) {
  if (origins.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-copper-400 mb-3">
        Por origen
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {origins.map(({ origin, count }) => {
          const isActive = origin === activeOrigin;
          return (
            <Link
              key={origin}
              href={`/explore/origin/${encodeURIComponent(origin)}`}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "bg-copper-500 text-white"
                  : "bg-linen text-espresso hover:bg-copper-100"
              }`}
            >
              {origin}
              <span className="ml-1.5 opacity-60">{count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
