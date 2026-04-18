import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardShell } from "./_components/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard — CUPPING",
};

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profileResult, collectionsResult] = await Promise.all([
    supabase
      .from("users")
      .select("display_name")
      .eq("id", user.id)
      .single(),
    supabase
      .from("collections")
      .select("id, type, name")
      .eq("user_id", user.id),
  ]);

  const firstName =
    profileResult.data?.display_name?.split(" ")[0] ?? "Barista";
  const collections = collectionsResult.data ?? [];

  // Item counts per collection
  const itemCounts: Record<string, number> = {};
  if (collections.length > 0) {
    const { data: items } = await supabase
      .from("collection_items")
      .select("collection_id")
      .in(
        "collection_id",
        collections.map((c) => c.id)
      );
    (items ?? []).forEach((item) => {
      itemCounts[item.collection_id] =
        (itemCounts[item.collection_id] ?? 0) + 1;
    });
  }

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <DashboardShell
        userId={user.id}
        firstName={firstName}
        collections={collections}
        itemCounts={itemCounts}
      />
    </div>
  );
}
