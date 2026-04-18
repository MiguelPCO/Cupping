import Link from "next/link";
import Image from "next/image";
import type { Coffee } from "@/types/coffee";
import { RatingCups } from "./rating-cups";
import { RoastBadge } from "./roast-badge";

interface CoffeeCommunityCardProps {
  coffee: Coffee;
}

export function CoffeeCommunityCard({ coffee }: CoffeeCommunityCardProps) {
  return (
    <div className="bg-white rounded-xl border border-parchment overflow-hidden">
      <div className="relative aspect-video bg-linen">
        {coffee.image_url ? (
          <Image
            src={coffee.image_url}
            alt={coffee.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="size-full flex items-center justify-center">
            <span className="text-4xl">☕</span>
          </div>
        )}
        {coffee.roast_level && (
          <div className="absolute top-2 left-2">
            <RoastBadge level={coffee.roast_level} />
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs text-espresso-light font-medium uppercase tracking-wide truncate">
          {coffee.brand}
        </p>
        <h3 className="font-display text-base text-espresso leading-tight truncate">
          {coffee.name}
        </h3>

        <div className="flex items-center gap-2 mt-2">
          {coffee.avg_rating !== null ? (
            <>
              <RatingCups value={coffee.avg_rating} readOnly size="sm" />
              <span className="text-xs text-espresso-light">
                ({coffee.total_reviews})
              </span>
            </>
          ) : (
            <span className="text-xs text-parchment">Sin reseñas aún</span>
          )}
        </div>

        <Link
          href={`/coffee/new?coffeeId=${coffee.id}`}
          className="mt-3 flex items-center justify-center w-full rounded-lg border border-copper-300 text-copper-600 text-xs font-medium py-1.5 hover:bg-copper-50 transition-colors"
        >
          Agregar mi reseña
        </Link>
      </div>
    </div>
  );
}
