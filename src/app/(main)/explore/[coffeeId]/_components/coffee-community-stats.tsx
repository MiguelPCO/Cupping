import type { CoffeeStats } from "@/lib/supabase/queries";
import { FlavorTag } from "@/components/coffee/flavor-tag";
import { getBrewMethodLabel } from "@/lib/utils";
import type { FlavorTag as FlavorTagType } from "@/types/coffee";

interface CoffeeCommunityStatsProps {
  stats: CoffeeStats;
  totalReviews: number;
}

const SUB_LABELS: Record<string, string> = {
  aroma: "Aroma",
  body: "Cuerpo",
  acidity: "Acidez",
  sweetness: "Dulzor",
  bitterness: "Amargor",
  aftertaste: "Retrogusto",
};

export function CoffeeCommunityStats({
  stats,
  totalReviews,
}: CoffeeCommunityStatsProps) {
  if (totalReviews === 0) return null;

  const maxDist = Math.max(...stats.rating_distribution.map((r) => r.count), 1);

  return (
    <div className="space-y-6 mb-8">
      {/* Rating distribution */}
      {stats.rating_distribution.length > 0 && (
        <section>
          <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-copper-400 mb-3">
            Distribución de valoraciones
          </p>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((bucket) => {
              const row = stats.rating_distribution.find((r) => r.bucket === bucket);
              const count = row?.count ?? 0;
              const pct = Math.round((count / maxDist) * 100);
              return (
                <div key={bucket} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-right font-mono text-espresso-light shrink-0">
                    {bucket}
                  </span>
                  <div className="flex-1 h-2 bg-parchment/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-copper-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-5 text-right font-mono text-parchment shrink-0">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Flavor tags */}
      {stats.flavor_tags.length > 0 && (
        <section>
          <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-copper-400 mb-3">
            Notas de sabor más mencionadas
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.flavor_tags.slice(0, 8).map(({ tag, count }) => (
              <div key={tag} className="flex items-center gap-1">
                <FlavorTag flavor={tag as FlavorTagType} size="sm" />
                <span className="text-[10px] font-mono text-parchment">×{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sub-rating averages */}
      {stats.sub_ratings && (
        <section>
          <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-copper-400 mb-3">
            Perfil sensorial (media comunidad)
          </p>
          <div className="space-y-2">
            {(
              Object.entries(stats.sub_ratings) as [string, number | null][]
            ).map(([key, value]) => {
              if (value === null) return null;
              const pct = Math.round((value / 10) * 100);
              return (
                <div key={key} className="flex items-center gap-3 text-xs">
                  <span className="w-20 text-espresso-light shrink-0">
                    {SUB_LABELS[key] ?? key}
                  </span>
                  <div className="flex-1 h-1.5 bg-parchment/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-copper-300 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-mono text-espresso-light shrink-0">
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Brew methods */}
      {stats.brew_methods.length > 0 && (
        <section>
          <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-copper-400 mb-3">
            Métodos de preparación
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.brew_methods.map(({ method, count }) => (
              <span
                key={method}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-linen border border-parchment text-xs text-espresso-light"
              >
                {getBrewMethodLabel(method)}
                <span className="font-mono text-parchment">{count}</span>
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
