import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCoffeesByOrigin, getUserReviewedCoffeeIds } from "@/lib/supabase/queries";
import { CoffeeCommunityCard } from "@/components/coffee/coffee-community-card";
import { BackButton } from "@/components/ui/back-button";

interface Props {
  params: Promise<{ origin: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { origin } = await params;
  const decoded = decodeURIComponent(origin);
  return {
    title: `Cafés de ${decoded} — CUPPING`,
    description: `Descubre los mejores cafés de origen ${decoded} valorados por la comunidad.`,
  };
}

export default async function OriginPage({ params }: Props) {
  const { origin } = await params;
  const decoded = decodeURIComponent(origin);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [coffees, reviewedIds] = await Promise.all([
    getCoffeesByOrigin(supabase, decoded, 50),
    user ? getUserReviewedCoffeeIds(supabase, user.id) : Promise.resolve([] as string[]),
  ]);

  if (coffees.length === 0) notFound();

  const reviewedSet = new Set(reviewedIds);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <BackButton className="mb-4" />
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-copper-400 mb-1">
        Origen
      </p>
      <h1 className="font-display text-3xl text-espresso mb-6">{decoded}</h1>
      <p className="text-sm text-espresso-light mb-6">
        {coffees.length} café{coffees.length !== 1 ? "s" : ""} encontrado{coffees.length !== 1 ? "s" : ""}
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
