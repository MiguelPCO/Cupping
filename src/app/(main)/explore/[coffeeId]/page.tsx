import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { User, PenLine } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCoffeeById, getEntriesForCoffee, getCoffeeStats } from "@/lib/supabase/queries";
import { CoffeeCommunityStats } from "./_components/coffee-community-stats";
import { RatingCups } from "@/components/coffee/rating-cups";
import { FlavorTag } from "@/components/coffee/flavor-tag";
import { RoastBadge } from "@/components/coffee/roast-badge";
import { BackButton } from "@/components/ui/back-button";
import { getCoffeeTypeLabel } from "@/lib/utils";
import { LikeButton } from "@/components/social/like-button";

interface Props {
  params: Promise<{ coffeeId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { coffeeId } = await params;
  const supabase = await createServerSupabaseClient();
  const coffee = await getCoffeeById(supabase, coffeeId);
  if (!coffee) return { title: "Café — CUPPING" };
  return {
    title: `${coffee.name} — CUPPING`,
    description: `${coffee.brand} · ${coffee.total_reviews} reseñas en la comunidad`,
  };
}

export default async function ExploreCoffeeDetailPage({ params }: Props) {
  const { coffeeId } = await params;
  const supabase = await createServerSupabaseClient();

  const [coffee, entries, stats] = await Promise.all([
    getCoffeeById(supabase, coffeeId),
    getEntriesForCoffee(supabase, coffeeId),
    getCoffeeStats(supabase, coffeeId),
  ]);

  if (!coffee) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <BackButton className="mb-4" />

      {/* Photo */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-linen mb-6">
        {coffee.image_url ? (
          <Image
            src={coffee.image_url}
            alt={coffee.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="size-full flex items-center justify-center">
            <span className="text-6xl opacity-20">☕</span>
          </div>
        )}
        {coffee.roast_level && (
          <RoastBadge level={coffee.roast_level} className="absolute bottom-3 left-3" />
        )}
      </div>

      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-copper-400 mb-1">
          {coffee.brand} · {getCoffeeTypeLabel(coffee.type)}
          {coffee.origin && ` · ${coffee.origin}`}
        </p>
        <h1 className="font-display text-3xl text-espresso leading-tight mb-3">
          {coffee.name}
        </h1>

        {coffee.avg_rating !== null ? (
          <div className="flex items-center gap-2">
            <RatingCups value={coffee.avg_rating} readOnly size="lg" showValue />
            <span className="text-sm text-espresso-light">
              ({coffee.total_reviews} reseña{coffee.total_reviews !== 1 ? "s" : ""})
            </span>
          </div>
        ) : (
          <p className="text-sm text-parchment">Sin reseñas aún</p>
        )}
      </div>

      {/* Community stats */}
      <CoffeeCommunityStats stats={stats} totalReviews={coffee.total_reviews} />

      {/* CTA */}
      <Link
        href={`/coffee/new?coffeeId=${coffee.id}`}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-copper-500 hover:bg-copper-600 text-white text-sm font-medium transition-colors mb-8"
      >
        <PenLine className="size-4" />
        Escribir mi reseña
      </Link>

      {/* Reviews */}
      {entries.length > 0 && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-copper-400 mb-3">
            Reseñas de la comunidad
          </p>
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl border border-parchment p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-8 rounded-full overflow-hidden bg-copper-100 flex items-center justify-center shrink-0">
                    {entry.user.avatar_url ? (
                      <Image
                        src={entry.user.avatar_url}
                        alt={entry.user.display_name}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <User className="size-4 text-copper-400" />
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/profile/${entry.user.username}`}
                      className="text-sm font-medium text-espresso hover:underline"
                    >
                      {entry.user.display_name}
                    </Link>
                    <p className="text-xs text-parchment">
                      {new Date(entry.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <RatingCups value={entry.rating_global} readOnly size="sm" showValue />

                {entry.notes && (
                  <p className="text-sm text-espresso-light mt-2 leading-relaxed">
                    {entry.notes}
                  </p>
                )}

                {entry.flavor_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {entry.flavor_tags.map((tag) => (
                      <FlavorTag key={tag} flavor={tag} size="sm" />
                    ))}
                  </div>
                )}
                <div className="flex justify-end mt-2 pt-2 border-t border-parchment/50">
                  <LikeButton entryId={entry.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
