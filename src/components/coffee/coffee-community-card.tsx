"use client";

import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import type { Coffee } from "@/types/coffee";
import { RatingCups } from "./rating-cups";
import { RoastBadge } from "./roast-badge";
import { SteamAnimation } from "@/components/ui/steam-animation";
import { brandToSlug } from "@/lib/brand-slug";

interface CoffeeCommunityCardProps {
  coffee: Coffee;
  isReviewed?: boolean;
}

export function CoffeeCommunityCard({ coffee, isReviewed = false }: CoffeeCommunityCardProps) {
  return (
    <Link
      href={`/explore/${coffee.id}`}
      className="group block bg-card rounded-xl overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
    >
      {/* Photo — 4:3, overlaid badges */}
      <div className="relative aspect-[4/3] bg-linen overflow-hidden">
        <SteamAnimation />
        {/* "Ya la probé" badge — top left */}
        {isReviewed && (
          <div className="absolute top-2 left-2 z-10 flex items-center justify-center size-6 rounded-full bg-copper-500 shadow-md">
            <Check className="size-3.5 text-white" strokeWidth={2.5} />
          </div>
        )}

        {coffee.image_url ? (
          <Image
            src={coffee.image_url}
            alt={coffee.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="size-full flex items-center justify-center bg-gradient-to-br from-copper-50 to-linen">
            <span className="text-5xl opacity-40">☕</span>
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
              showValue
            />
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
          <Link
            href={`/explore/brand/${brandToSlug(coffee.brand)}`}
            className="hover:text-copper-500 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {coffee.brand}
          </Link>
        </p>
        <h3 className="font-display text-lg text-espresso leading-tight truncate">
          {coffee.name}
        </h3>
        {coffee.avg_rating === null && (
          <p className="text-xs text-parchment mt-1">Sin reseñas aún</p>
        )}
      </div>
    </Link>
  );
}
