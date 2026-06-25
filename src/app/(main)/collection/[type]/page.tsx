import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCollectionItems } from "@/lib/supabase/queries";
import { COLLECTION_TYPES } from "@/types/coffee";
import type { CollectionType } from "@/types/coffee";
import { CollectionCoffeeList } from "./_components/collection-coffee-list";

interface Props {
  params: Promise<{ type: string }>;
}

const COLLECTION_LABELS: Record<CollectionType, string> = {
  at_home: "En casa",
  favorites: "Favoritos",
  to_try: "Por probar",
  tried: "Probados",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const label = COLLECTION_LABELS[type as CollectionType] ?? "Colección";
  return { title: `${label} — CUPPING` };
}

export default async function CollectionTypePage({ params }: Props) {
  const { type } = await params;

  if (!COLLECTION_TYPES.includes(type as CollectionType)) notFound();

  const collectionType = type as CollectionType;
  const label = COLLECTION_LABELS[collectionType];

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all user collections
  const { data: allCollections } = await supabase
    .from("collections")
    .select("id, type")
    .eq("user_id", user.id);

  const currentCollection = (allCollections ?? []).find((c) => c.type === collectionType);
  const otherCollections = (allCollections ?? []).filter((c) => c.type !== collectionType);

  const coffees = currentCollection
    ? await getCollectionItems(supabase, currentCollection.id)
    : [];

  // Build entryId map: coffeeId → user's most recent entry id
  let entryIdMap: Record<string, string> = {};
  if (coffees.length > 0) {
    const coffeeIds = coffees.map((c) => c.id);
    const { data: entries } = await supabase
      .from("coffee_entries")
      .select("id, coffee_id")
      .eq("user_id", user.id)
      .in("coffee_id", coffeeIds)
      .order("created_at", { ascending: false });

    (entries ?? []).forEach((e) => {
      if (!entryIdMap[e.coffee_id]) entryIdMap[e.coffee_id] = e.id;
    });
  }

  return (
    <div className="px-4 sm:px-6 py-8 sm:py-10 max-w-6xl mx-auto">
      <h1 className="font-display text-3xl text-espresso mb-6">{label}</h1>
      <CollectionCoffeeList
        coffees={coffees}
        collectionLabel={label}
        collectionId={currentCollection?.id ?? ""}
        entryIdMap={entryIdMap}
        otherCollections={otherCollections}
      />
    </div>
  );
}
