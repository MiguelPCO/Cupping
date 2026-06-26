import { cache } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEntryById } from "@/lib/supabase/queries";

const getCachedEntry = cache(async (id: string) => {
  const supabase = await createServerSupabaseClient();
  return getEntryById(supabase, id);
});
import { FlavorTag, RoastBadge, BrewMethodIcon } from "@/components/coffee";
import { RatingCups } from "@/components/coffee";
import { EntryActions } from "./_components/entry-actions";
import { BackButton } from "@/components/ui/back-button";
import { getCoffeeTypeLabel } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entry = await getCachedEntry(id);
  if (!entry) return { title: "Reseña — CUPPING" };
  const coffeeName = entry.coffee?.name ?? "Café";
  const coffeeBrand = entry.coffee?.brand ?? "";
  return {
    title: `${coffeeName} — CUPPING`,
    description: entry.notes
      ? entry.notes.slice(0, 155)
      : `Reseña de ${coffeeBrand} ${coffeeName} en CUPPING`,
    openGraph: {
      title: coffeeName,
      description: `${coffeeBrand} · ${entry.rating_global}★`,
      images: entry.photo_url ? [{ url: entry.photo_url }] : [],
    },
  };
}

type RatingFields = {
  rating_aroma: number;
  rating_body: number;
  rating_acidity: number;
  rating_sweetness: number;
  rating_bitterness: number;
  rating_aftertaste: number;
};

const SUB_RATING_LABELS: { key: keyof RatingFields; label: string }[] = [
  { key: "rating_aroma", label: "Aroma" },
  { key: "rating_body", label: "Cuerpo" },
  { key: "rating_acidity", label: "Acidez" },
  { key: "rating_sweetness", label: "Dulzor" },
  { key: "rating_bitterness", label: "Amargor" },
  { key: "rating_aftertaste", label: "Retrogusto" },
];

export default async function CoffeeDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const entry = await getCachedEntry(id);
  if (!entry) notFound();

  const { coffee } = entry;
  const isOwner = user?.id === entry.user_id;

  const hasSubRatings = SUB_RATING_LABELS.some(
    ({ key }) => entry[key as keyof typeof entry] !== null
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <BackButton className="mb-4" />
      {/* Photo */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-parchment mb-6">
        {entry.photo_url ? (
          <Image
            src={entry.photo_url}
            alt={coffee.name}
            fill
            className="object-cover"
            priority
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
          <RoastBadge level={coffee.roast_level} className="absolute bottom-3 left-3" />
        )}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl text-espresso leading-tight">
            {coffee.name}
          </h1>
          <p className="text-espresso-light mt-1">
            {coffee.brand} · {getCoffeeTypeLabel(coffee.type)}
            {coffee.origin && ` · ${coffee.origin}`}
          </p>
        </div>
        {isOwner && <EntryActions entryId={entry.id} />}
      </div>

      {/* Global rating */}
      <div className="mb-6">
        <RatingCups value={entry.rating_global} readOnly size="lg" showValue />
      </div>

      {/* Flavor tags */}
      {entry.flavor_tags.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-parchment mb-3">
            Notas de sabor
          </p>
          <div className="flex flex-wrap gap-2">
            {entry.flavor_tags.map((tag) => (
              <FlavorTag key={tag} flavor={tag} />
            ))}
          </div>
        </div>
      )}

      {/* Sub-ratings */}
      {hasSubRatings && (
        <div className="mb-6 bg-card rounded-xl border border-parchment p-4 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-parchment">
            Desglose
          </p>
          {SUB_RATING_LABELS.map(({ key, label }) => {
            const value = entry[key as keyof typeof entry] as number | null;
            if (value === null) return null;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-espresso">{label}</span>
                  <span className="font-mono text-sm text-copper-600">{value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-parchment overflow-hidden">
                  <div
                    className="h-full rounded-full bg-copper-500 transition-[width]"
                    style={{ width: `${(value / 10) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notes */}
      {entry.notes && (
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-parchment mb-2">
            Notas
          </p>
          <p className="text-espresso-light leading-relaxed">{entry.notes}</p>
        </div>
      )}

      {/* Brew method */}
      {entry.brew_method && (
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-parchment mb-2">
            Método
          </p>
          <BrewMethodIcon method={entry.brew_method} />
        </div>
      )}

      {/* Date */}
      <p className="text-xs text-parchment">
        {new Date(entry.created_at).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Review",
            itemReviewed: {
              "@type": "Product",
              name: coffee.name,
              brand: { "@type": "Brand", name: coffee.brand },
              ...(coffee.origin && { description: `Origen: ${coffee.origin}` }),
              ...(entry.photo_url && { image: entry.photo_url }),
            },
            reviewRating: {
              "@type": "Rating",
              ratingValue: entry.rating_global,
              bestRating: 5,
              worstRating: 0.5,
            },
            ...(entry.notes && { reviewBody: entry.notes }),
            datePublished: entry.created_at,
          }).replace(/<\//g, "<\\/"),
        }}
      />
    </div>
  );
}
