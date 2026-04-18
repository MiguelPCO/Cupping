import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
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

  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", collectionType)
    .single();

  type CoffeeRow = {
    id: string;
    name: string;
    brand: string;
    avg_rating: number | null;
  };

  type CollectionItemRow = {
    added_at: string;
    coffee: CoffeeRow | null;
  };

  const items: CollectionItemRow[] = collection
    ? await supabase
        .from("collection_items")
        .select("added_at, coffee:coffees(id, name, brand, avg_rating)")
        .eq("collection_id", collection.id)
        .order("added_at", { ascending: false })
        .then(({ data }) => (data as unknown as CollectionItemRow[]) ?? [])
    : [];

  const coffees = items
    .map((item) =>
      item.coffee ? { ...item.coffee, added_at: item.added_at } : null
    )
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl text-espresso mb-6">{label}</h1>
      <CollectionCoffeeList coffees={coffees} collectionLabel={label} />
    </div>
  );
}
