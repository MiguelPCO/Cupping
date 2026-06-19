"use client";

import { useState } from "react";
import Link from "next/link";
import { Library, Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoffeeCard } from "@/components/coffee/coffee-card";
import { EmptyState } from "@/components/coffee/empty-state";
import type { CoffeeEntryWithCoffee } from "@/types/coffee";
import type { CollectionCoffeeItem } from "@/lib/supabase/queries";

type Tab = "resenas" | "favoritos";

interface ProfileTabsProps {
  entries: CoffeeEntryWithCoffee[];
  favoriteItems: CollectionCoffeeItem[];
  currentUserId?: string;
  isOwnProfile: boolean;
  profileDisplayName: string;
}

export function ProfileTabs({
  entries,
  favoriteItems,
  currentUserId,
  isOwnProfile,
  profileDisplayName,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("resenas");

  const tabs: { id: Tab; label: string; count: number; icon: typeof Library }[] = [
    { id: "resenas", label: "Reseñas", count: entries.length, icon: Library },
    { id: "favoritos", label: "Favoritos", count: favoriteItems.length, icon: Heart },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-parchment mb-5">
        {tabs.map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === id
                ? "border-copper-500 text-espresso"
                : "border-transparent text-espresso-light hover:text-espresso"
            )}
          >
            <Icon className="size-3.5" />
            {label}
            <span
              className={cn(
                "text-[10px] font-mono rounded-full px-1.5",
                activeTab === id
                  ? "bg-copper-100 text-copper-700"
                  : "bg-parchment/60 text-parchment"
              )}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Reseñas tab */}
      {activeTab === "resenas" && (
        <>
          {entries.length === 0 ? (
            <EmptyState
              icon={Library}
              title="Sin reseñas aún"
              description={
                isOwnProfile
                  ? "Comienza registrando tu primer café"
                  : `${profileDisplayName} aún no tiene reseñas`
              }
              action={
                isOwnProfile
                  ? { label: "Añadir reseña", href: "/coffee/new" }
                  : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {entries.map((entry, index) => (
                <CoffeeCard
                  key={entry.id}
                  entry={entry}
                  currentUserId={currentUserId}
                  priority={index === 0}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Favoritos tab */}
      {activeTab === "favoritos" && (
        <>
          {favoriteItems.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Sin favoritos aún"
              description={
                isOwnProfile
                  ? "Añade cafés a tu colección de favoritos"
                  : `${profileDisplayName} aún no tiene favoritos`
              }
              action={
                isOwnProfile
                  ? { label: "Explorar cafés", href: "/explore" }
                  : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoriteItems.map((coffee) => (
                <Link
                  key={coffee.id}
                  href={`/explore/${coffee.id}`}
                  className="block bg-white rounded-xl border border-parchment p-4 hover:border-copper-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Star className="size-3 text-copper-500 fill-copper-500" />
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-copper-500">
                      Favorito
                    </p>
                  </div>
                  <h3 className="font-display text-lg text-espresso truncate group-hover:text-copper-600 transition-colors">
                    {coffee.name}
                  </h3>
                  <p className="text-xs text-espresso-light mt-0.5 truncate">{coffee.brand}</p>
                  {coffee.avg_rating !== null && (
                    <p className="font-mono text-sm text-copper-600 mt-2">
                      {coffee.avg_rating.toFixed(1)} ★
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
