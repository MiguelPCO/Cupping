import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Home, Heart, BookmarkPlus, CheckCircle } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Colección — CUPPING",
};

const COLLECTION_META = {
  at_home:   { label: "En casa",    description: "Cafés que tienes actualmente", icon: Home,          color: "text-copper-600 bg-copper-50" },
  favorites: { label: "Favoritos",  description: "Los mejores de tu colección",  icon: Heart,         color: "text-copper-600 bg-copper-50" },
  to_try:    { label: "Por probar", description: "Cafés en tu lista de deseos",  icon: BookmarkPlus,  color: "text-espresso bg-linen" },
  tried:     { label: "Probados",   description: "Todo lo que has catado",        icon: CheckCircle,   color: "text-espresso bg-linen" },
} as const;

type CollectionType = keyof typeof COLLECTION_META;

export default async function CollectionPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: collections } = await supabase
    .from("collections")
    .select("id, type")
    .eq("user_id", user.id);

  // Get item counts per collection
  const countMap: Record<string, number> = {};
  if (collections && collections.length > 0) {
    const ids = collections.map((c) => c.id);
    const { data: items } = await supabase
      .from("collection_items")
      .select("collection_id")
      .in("collection_id", ids);

    (items ?? []).forEach((item) => {
      countMap[item.collection_id] = (countMap[item.collection_id] ?? 0) + 1;
    });
  }

  const collectionByType = Object.fromEntries(
    (collections ?? []).map((c) => [c.type, c])
  );

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-espresso mb-6">Mi colección</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(Object.keys(COLLECTION_META) as CollectionType[]).map((type) => {
          const { label, description, icon: Icon, color } = COLLECTION_META[type];
          const col = collectionByType[type];
          const count = col ? (countMap[col.id] ?? 0) : 0;

          return (
            <Link
              key={type}
              href={`/collection/${type}`}
              className="flex items-center gap-4 p-5 bg-white rounded-xl border border-parchment hover:border-copper-300 hover:shadow-sm transition-all group"
            >
              <div className={`flex items-center justify-center size-12 rounded-full shrink-0 ${color}`}>
                <Icon className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-espresso">{label}</p>
                <p className="text-xs text-espresso-light mt-0.5">{description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-lg font-medium text-copper-600">{count}</p>
                <p className="text-xs text-parchment">cafés</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
