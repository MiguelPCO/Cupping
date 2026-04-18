import type { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cupping.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  try {
    const supabase = await createServerSupabaseClient();

    const [usersResult, coffeesResult] = await Promise.all([
      supabase.from("users").select("username, updated_at").limit(1000),
      supabase
        .from("coffees")
        .select("id, created_at")
        .order("avg_rating", { ascending: false })
        .limit(500),
    ]);

    const profileRoutes: MetadataRoute.Sitemap = (
      usersResult.data ?? []
    ).map((u) => ({
      url: `${BASE_URL}/profile/${u.username}`,
      lastModified: new Date(u.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    const coffeeRoutes: MetadataRoute.Sitemap = (
      coffeesResult.data ?? []
    ).map((c) => ({
      url: `${BASE_URL}/coffee/${c.id}`,
      lastModified: new Date(c.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

    return [...staticRoutes, ...profileRoutes, ...coffeeRoutes];
  } catch {
    // Return static routes only if DB is unavailable at build time
    return staticRoutes;
  }
}
