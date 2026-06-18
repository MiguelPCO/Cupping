"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { RatingCups } from "./rating-cups";
import { FlavorTag } from "./flavor-tag";
import { RoastBadge } from "./roast-badge";
import { SteamAnimation } from "@/components/ui/steam-animation";
import { getCoffeeTypeLabel } from "@/lib/utils";
import type { CoffeeEntryWithCoffee } from "@/types/coffee";

interface CoffeeCardProps {
  entry: CoffeeEntryWithCoffee;
  currentUserId?: string;
  onEdit?: (entryId: string) => void;
  onDelete?: (entryId: string) => void;
  priority?: boolean;
}

export function CoffeeCard({
  entry,
  currentUserId,
  onEdit,
  onDelete,
  priority = false,
}: CoffeeCardProps) {
  const { coffee } = entry;
  const isOwner = currentUserId === entry.user_id;
  const visibleTags = entry.flavor_tags.slice(0, 2);
  const extraTags = entry.flavor_tags.length - 2;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
      {/* Photo wrapper — action buttons sit outside <Link> so they don't navigate */}
      <div className="relative aspect-[4/3] overflow-hidden bg-linen">
        <Link href={`/coffee/${entry.id}`} className="absolute inset-0 z-0">
          <SteamAnimation />
          {entry.photo_url ? (
            <Image
              src={entry.photo_url}
              alt={coffee.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-linen), var(--color-parchment))",
              }}
            />
          )}
        </Link>

        {/* Bottom gradient for badge legibility (only with photo) */}
        {entry.photo_url && (
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/35 to-transparent pointer-events-none z-10" />
        )}

        {coffee.roast_level && (
          <RoastBadge
            level={coffee.roast_level}
            className="absolute bottom-2.5 left-2.5 z-20"
          />
        )}

        {/* Always-visible edit/delete — outside Link, no navigation on click */}
        {isOwner && (onEdit || onDelete) && (
          <div className="absolute bottom-2.5 right-2.5 flex gap-1 z-20">
            {onEdit && (
              <button
                onClick={() => onEdit(entry.id)}
                aria-label="Editar reseña"
                className="flex items-center justify-center size-7 rounded-lg bg-black/55 backdrop-blur-sm text-white hover:bg-black/75 transition-colors"
              >
                <Pencil className="size-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(entry.id)}
                aria-label="Eliminar reseña"
                className="flex items-center justify-center size-7 rounded-lg bg-black/55 backdrop-blur-sm text-white hover:bg-destructive/80 transition-colors"
              >
                <Trash2 className="size-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3.5 space-y-2">
        <Link href={`/coffee/${entry.id}`} className="block">
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-copper-400 mb-1 truncate">
            {coffee.brand} · {getCoffeeTypeLabel(coffee.type)}
          </p>
          <h3 className="font-display text-xl text-espresso leading-tight truncate">
            {coffee.name}
          </h3>
        </Link>

        <RatingCups value={entry.rating_global} readOnly size="sm" showValue />

        {visibleTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleTags.map((tag) => (
              <FlavorTag key={tag} flavor={tag} size="sm" />
            ))}
            {extraTags > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-linen text-espresso-light">
                +{extraTags}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
