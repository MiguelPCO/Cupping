import Link from "next/link";

interface BrandChipsProps {
  brands: { brand: string; slug: string; coffee_count: number; total_reviews: number }[];
  activeBrandSlug?: string;
}

export function BrandChips({ brands, activeBrandSlug }: BrandChipsProps) {
  if (brands.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-copper-400 mb-3">
        Tostadores activos
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {brands.map(({ brand, slug, total_reviews }) => {
          const isActive = slug === activeBrandSlug;
          return (
            <Link
              key={slug}
              href={`/explore/brand/${slug}`}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "bg-copper-500 text-white"
                  : "bg-linen text-espresso hover:bg-copper-100"
              }`}
            >
              {brand}
              <span className="ml-1.5 opacity-60">{total_reviews}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
