import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getBrandCoffees,
  getBrandStats,
  getUserReviewedCoffeeIds,
} from "@/lib/supabase/queries";
import { slugToSearchTerm } from "@/lib/brand-slug";
import { CoffeeCommunityCard } from "@/components/coffee/coffee-community-card";
import { BackButton } from "@/components/ui/back-button";
import { FlavorTag } from "@/components/coffee/flavor-tag";
import { RatingCups } from "@/components/coffee/rating-cups";
import type { FlavorTag as FlavorTagType } from "@/types/coffee";

interface Props {
  params: Promise<{ brandSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug } = await params;
  const brandName = slugToSearchTerm(brandSlug)
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title: `${brandName} — CUPPING`,
    description: `Todos los cafés de ${brandName} valorados por la comunidad CUPPING.`,
  };
}

export default async function BrandHubPage({ params }: Props) {
  const { brandSlug } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [coffees, stats, reviewedIds] = await Promise.all([
    getBrandCoffees(supabase, brandSlug, 50),
    getBrandStats(supabase, brandSlug),
    user
      ? getUserReviewedCoffeeIds(supabase, user.id)
      : Promise.resolve([] as string[]),
  ]);

  if (coffees.length === 0) notFound();

  const brandName = coffees[0]?.brand ?? slugToSearchTerm(brandSlug);
  const reviewedSet = new Set(reviewedIds);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <BackButton className="mb-4" />

      {/* Brand header */}
      <div className="mb-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-copper-400 mb-1">
          Tostador / Marca
        </p>
        <h1 className="font-display text-3xl text-espresso mb-4">{brandName}</h1>

        {/* Stats row */}
        <div className="flex flex-wrap gap-6 text-sm text-espresso-light">
          <span>
            <span className="font-medium text-espresso">{stats.total_coffees}</span>{" "}
            café{stats.total_coffees !== 1 ? "s" : ""}
          </span>
          <span>
            <span className="font-medium text-espresso">{stats.total_reviews}</span>{" "}
            reseña{stats.total_reviews !== 1 ? "s" : ""}
          </span>
          {stats.avg_rating !== null && (
            <span className="flex items-center gap-1.5">
              <RatingCups value={stats.avg_rating} readOnly size="sm" showValue />
              <span>media</span>
            </span>
          )}
          {stats.top_origin && (
            <span>
              Origen principal:{" "}
              <Link
                href={`/explore/origin/${encodeURIComponent(stats.top_origin)}`}
                className="text-copper-500 hover:underline"
              >
                {stats.top_origin}
              </Link>
            </span>
          )}
        </div>

        {/* Top flavor tags */}
        {stats.top_flavor_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {stats.top_flavor_tags.map((tag) => (
              <FlavorTag key={tag} flavor={tag as FlavorTagType} />
            ))}
          </div>
        )}
      </div>

      {/* Coffee grid */}
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-copper-400 mb-3">
        Catálogo
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coffees.map((coffee) => (
          <CoffeeCommunityCard
            key={coffee.id}
            coffee={coffee}
            isReviewed={reviewedSet.has(coffee.id)}
          />
        ))}
      </div>
    </div>
  );
}
