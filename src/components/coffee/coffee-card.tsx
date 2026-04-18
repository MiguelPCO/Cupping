"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { RatingCups } from "./rating-cups";
import { FlavorTag } from "./flavor-tag";
import { RoastBadge } from "./roast-badge";
import { BrewMethodIcon } from "./brew-method-icon";
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
  const visibleTags = entry.flavor_tags.slice(0, 3);
  const extraTags = entry.flavor_tags.length - 3;

  return (
    <div className="bg-white rounded-xl border border-parchment overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {/* Photo */}
      <Link href={`/coffee/${entry.id}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-parchment">
          <SteamAnimation />
          {entry.photo_url ? (
            <Image
              src={entry.photo_url}
              alt={coffee.name}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-roast-dark), var(--color-roast-medium))",
              }}
            />
          )}
          {coffee.roast_level && (
            <RoastBadge
              level={coffee.roast_level}
              className="absolute bottom-2 left-2"
            />
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/coffee/${entry.id}`} className="flex-1 min-w-0">
            <h3 className="font-display text-lg text-espresso leading-tight truncate">
              {coffee.name}
            </h3>
            <p className="text-xs text-espresso-light truncate mt-0.5">
              {coffee.brand} · {getCoffeeTypeLabel(coffee.type)}
            </p>
          </Link>

          {isOwner && (onEdit || onDelete) && (
            <div className="flex gap-1 shrink-0">
              {onEdit && (
                <button
                  onClick={() => onEdit(entry.id)}
                  aria-label="Editar reseña"
                  className="flex items-center justify-center size-10 rounded-md text-espresso-light hover:bg-linen hover:text-espresso transition-colors"
                >
                  <Pencil className="size-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(entry.id)}
                  aria-label="Eliminar reseña"
                  className="flex items-center justify-center size-10 rounded-md text-espresso-light hover:bg-destructive/5 hover:text-destructive transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

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

        {entry.brew_method && <BrewMethodIcon method={entry.brew_method} />}

        {entry.notes && (
          <p className="text-xs text-espresso-light line-clamp-2 leading-relaxed">
            {entry.notes}
          </p>
        )}
      </div>
    </div>
  );
}
