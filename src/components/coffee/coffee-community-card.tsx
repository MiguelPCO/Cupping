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
    <Link
      href={`/coffee/new?coffeeId=${coffee.id}`}
      className="block bg-white rounded-xl overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
    >
      {/* Photo — 4:3, overlaid badges */}
      <div className="relative aspect-[4/3] bg-linen overflow-hidden">
        {coffee.image_url ? (
          <Image
            src={coffee.image_url}
            alt={coffee.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="size-full flex items-center justify-center">
            <span className="text-4xl opacity-30">☕</span>
          </div>
        )}

        {/* Bottom gradient for overlay legibility */}
        {coffee.image_url && (
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        )}

        {/* Rating overlay — top right */}
        {coffee.avg_rating !== null && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 z-10">
            <RatingCups
              value={coffee.avg_rating}
              readOnly
              size="sm"
              showValue={false}
            />
            <span className="font-mono text-[11px] font-medium text-white tabular-nums">
              {coffee.avg_rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Review count — bottom right */}
        {coffee.total_reviews > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/55 backdrop-blur-sm rounded px-1.5 py-0.5 z-10">
            <span className="text-[10.5px] text-white/85">
              {coffee.total_reviews} reseña{coffee.total_reviews !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Roast badge — bottom left */}
        {coffee.roast_level && (
          <RoastBadge
            level={coffee.roast_level}
            className="absolute bottom-2 left-2 z-10"
          />
        )}
      </div>

      {/* Body */}
      <div className="p-3 pb-3.5">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-copper-400 mb-1 truncate">
          {coffee.brand}
        </p>
        <h3 className="font-display text-base text-espresso leading-tight truncate">
          {coffee.name}
        </h3>
        {coffee.avg_rating === null && (
          <p className="text-xs text-parchment mt-1">Sin reseñas aún</p>
        )}
      </div>
    </Link>
  );
}
