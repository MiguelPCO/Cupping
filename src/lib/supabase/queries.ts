import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type {
  ActivityItem,
  Coffee,
  CoffeeEntryWithCoffee,
  CoffeeType,
  BrewMethod,
  FlavorTag,
  RoastLevel,
  Visibility,
} from "@/types/coffee";
import { brandToSlug } from "@/lib/brand-slug";

type Supabase = SupabaseClient<Database>;

// Raw shape returned by the joined select — Supabase inference is not used here
type RawEntry = {
  id: string;
  user_id: string;
  coffee_id: string;
  rating_global: number;
  rating_aroma: number | null;
  rating_body: number | null;
  rating_acidity: number | null;
  rating_sweetness: number | null;
  rating_bitterness: number | null;
  rating_aftertaste: number | null;
  notes: string | null;
  photo_url: string | null;
  brew_method: string | null;
  visibility: string;
  created_at: string;
  updated_at: string;
  coffee: {
    id: string;
    name: string;
    brand: string;
    type: string;
    origin: string | null;
    roast_level: string | null;
    image_url: string | null;
    avg_rating: number | null;
    total_reviews: number;
    created_at: string;
  };
  flavor_tags: { tag: string }[];
};

function transformEntry(raw: RawEntry): CoffeeEntryWithCoffee {
  return {
    id: raw.id,
    user_id: raw.user_id,
    coffee_id: raw.coffee_id,
    rating_global: raw.rating_global,
    rating_aroma: raw.rating_aroma,
    rating_body: raw.rating_body,
    rating_acidity: raw.rating_acidity,
    rating_sweetness: raw.rating_sweetness,
    rating_bitterness: raw.rating_bitterness,
    rating_aftertaste: raw.rating_aftertaste,
    notes: raw.notes,
    photo_url: raw.photo_url,
    brew_method: raw.brew_method as BrewMethod | null,
    visibility: raw.visibility as Visibility,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    flavor_tags: raw.flavor_tags.map((ft) => ft.tag as FlavorTag),
    coffee: {
      id: raw.coffee.id,
      name: raw.coffee.name,
      brand: raw.coffee.brand,
      type: raw.coffee.type as CoffeeType,
      origin: raw.coffee.origin,
      roast_level: raw.coffee.roast_level as RoastLevel | null,
      image_url: raw.coffee.image_url,
      avg_rating: raw.coffee.avg_rating,
      total_reviews: raw.coffee.total_reviews,
      created_at: raw.coffee.created_at,
    },
  };
}

const ENTRY_SELECT =
  "*, coffee:coffees(*), flavor_tags:entry_flavor_tags(tag)" as const;

export async function getEntriesForUser(
  supabase: Supabase,
  userId: string,
  onlyPublic = false,
  limit?: number
): Promise<CoffeeEntryWithCoffee[]> {
  let query = supabase
    .from("coffee_entries")
    .select(ENTRY_SELECT)
    .eq("user_id", userId);

  if (onlyPublic) {
    query = query.eq("visibility", "public");
  }

  query = query.order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as RawEntry[]).map(transformEntry);
}

export async function getEntryById(
  supabase: Supabase,
  entryId: string
): Promise<CoffeeEntryWithCoffee | null> {
  const { data, error } = await supabase
    .from("coffee_entries")
    .select(ENTRY_SELECT)
    .eq("id", entryId)
    .single();

  if (error || !data) return null;
  return transformEntry(data as unknown as RawEntry);
}

export async function getCoffeeCatalog(
  supabase: Supabase,
  opts: { page?: number; pageSize?: number } = {}
) {
  const { page = 0, pageSize = 20 } = opts;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("coffees")
    .select("*")
    .order("avg_rating", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (error) throw error;
  return data ?? [];
}

export async function getCoffeeById(
  supabase: Supabase,
  coffeeId: string
) {
  const { data, error } = await supabase
    .from("coffees")
    .select("*")
    .eq("id", coffeeId)
    .single();
  if (error || !data) return null;
  return data;
}

type RawPublicEntry = RawEntry & {
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export type PublicEntry = CoffeeEntryWithCoffee & {
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export async function getEntriesForCoffee(
  supabase: Supabase,
  coffeeId: string
): Promise<PublicEntry[]> {
  const { data, error } = await supabase
    .from("coffee_entries")
    .select(
      "*, coffee:coffees(*), flavor_tags:entry_flavor_tags(tag), user:users!coffee_entries_user_id_fkey(id, username, display_name, avatar_url)"
    )
    .eq("coffee_id", coffeeId)
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as RawPublicEntry[]).map((raw) => ({
    ...transformEntry(raw),
    user: raw.user,
  }));
}

export async function getUserProfile(supabase: Supabase, username: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getFollowingIds(
  supabase: Supabase,
  userId: string
): Promise<string[]> {
  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);
  return (data ?? []).map((r) => r.following_id);
}

type RawActivityEntry = RawEntry & {
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export async function getActivityFeed(
  supabase: Supabase,
  userId: string,
  page = 0,
  pageSize = 10
): Promise<ActivityItem[]> {
  const followingIds = await getFollowingIds(supabase, userId);
  if (followingIds.length === 0) return [];

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("coffee_entries")
    .select(
      "*, coffee:coffees(*), flavor_tags:entry_flavor_tags(tag), user:users!coffee_entries_user_id_fkey(id, username, display_name, avatar_url)"
    )
    .in("user_id", followingIds)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return [];

  return (data as unknown as RawActivityEntry[]).map((raw) => ({
    id: raw.id,
    created_at: raw.created_at,
    user: raw.user,
    entry: transformEntry(raw),
  }));
}

type RawCollectionItem = {
  added_at: string;
  coffee: {
    id: string;
    name: string;
    brand: string;
    avg_rating: number | null;
  } | null;
};

export type CollectionCoffeeItem = {
  id: string;
  name: string;
  brand: string;
  avg_rating: number | null;
  added_at: string;
};

export type CoffeeStats = {
  flavor_tags: { tag: FlavorTag; count: number }[];
  brew_methods: { method: BrewMethod; count: number }[];
  sub_ratings: {
    aroma: number | null;
    body: number | null;
    acidity: number | null;
    sweetness: number | null;
    bitterness: number | null;
    aftertaste: number | null;
  } | null;
  rating_distribution: { bucket: number; count: number }[];
};

export async function getCoffeeStats(
  supabase: Supabase,
  coffeeId: string
): Promise<CoffeeStats> {
  const [flavors, brews, subs, dist] = await Promise.all([
    supabase
      .from("coffee_flavor_stats")
      .select("tag, mention_count")
      .eq("coffee_id", coffeeId)
      .order("mention_count", { ascending: false }),
    supabase
      .from("coffee_brew_stats")
      .select("brew_method, usage_count")
      .eq("coffee_id", coffeeId)
      .order("usage_count", { ascending: false }),
    supabase
      .from("coffee_subrating_avgs")
      .select("avg_aroma, avg_body, avg_acidity, avg_sweetness, avg_bitterness, avg_aftertaste")
      .eq("coffee_id", coffeeId)
      .maybeSingle(),
    supabase
      .from("coffee_rating_distribution")
      .select("bucket, count")
      .eq("coffee_id", coffeeId)
      .order("bucket", { ascending: false }),
  ]);

  return {
    flavor_tags: (flavors.data ?? []).map((r) => ({
      tag: r.tag as FlavorTag,
      count: r.mention_count,
    })),
    brew_methods: (brews.data ?? []).map((r) => ({
      method: r.brew_method as BrewMethod,
      count: r.usage_count,
    })),
    sub_ratings: subs.data
      ? {
          aroma: subs.data.avg_aroma,
          body: subs.data.avg_body,
          acidity: subs.data.avg_acidity,
          sweetness: subs.data.avg_sweetness,
          bitterness: subs.data.avg_bitterness,
          aftertaste: subs.data.avg_aftertaste,
        }
      : null,
    rating_distribution: (dist.data ?? []).map((r) => ({
      bucket: r.bucket,
      count: r.count,
    })),
  };
}

export async function getTrendingCoffees(
  supabase: Supabase,
  limit = 6
): Promise<Coffee[]> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: entries, error: entriesError } = await supabase
    .from("coffee_entries")
    .select("coffee_id")
    .gte("created_at", since)
    .limit(500);

  if (entriesError || !entries || entries.length === 0) return [];

  const counts: Record<string, number> = {};
  for (const { coffee_id } of entries) {
    counts[coffee_id] = (counts[coffee_id] ?? 0) + 1;
  }

  const topIds = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => id);

  const { data } = await supabase
    .from("coffees")
    .select("*")
    .in("id", topIds);

  const coffees = ((data ?? []) as unknown) as Coffee[];
  return coffees.sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));
}

export async function getTopRatedCoffees(
  supabase: Supabase,
  minReviews = 3,
  limit = 9
): Promise<Coffee[]> {
  const { data } = await supabase
    .from("coffees")
    .select("*")
    .gte("total_reviews", minReviews)
    .not("avg_rating", "is", null)
    .order("avg_rating", { ascending: false, nullsFirst: false })
    .limit(limit);

  return ((data ?? []) as unknown) as Coffee[];
}

export async function getDistinctOrigins(
  supabase: Supabase,
  minCoffees = 1
): Promise<string[]> {
  const { data, error: originsError } = await supabase
    .from("coffees")
    .select("origin")
    .not("origin", "is", null)
    .limit(1000);

  if (originsError || !data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    if (row.origin) counts[row.origin] = (counts[row.origin] ?? 0) + 1;
  }

  return Object.entries(counts)
    .filter(([, count]) => count >= minCoffees)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([origin]) => origin);
}

export async function getCoffeesByOrigin(
  supabase: Supabase,
  origin: string,
  limit = 6
): Promise<Coffee[]> {
  const { data } = await supabase
    .from("coffees")
    .select("*")
    .eq("origin", origin)
    .order("avg_rating", { ascending: false, nullsFirst: false })
    .limit(limit);

  return ((data ?? []) as unknown) as Coffee[];
}

export async function getUserReviewedCoffeeIds(
  supabase: Supabase,
  userId: string
): Promise<string[]> {
  const { data } = await supabase
    .from("coffee_entries")
    .select("coffee_id")
    .eq("user_id", userId);

  return (data ?? []).map((r) => r.coffee_id);
}

export async function getCollectionItems(
  supabase: Supabase,
  collectionId: string
): Promise<CollectionCoffeeItem[]> {
  const { data, error } = await supabase
    .from("collection_items")
    .select("added_at, coffee:coffees(id, name, brand, avg_rating)")
    .eq("collection_id", collectionId)
    .order("added_at", { ascending: false });

  if (error || !data) return [];

  return (data as unknown as RawCollectionItem[])
    .map((item) =>
      item.coffee ? { ...item.coffee, added_at: item.added_at } : null
    )
    .filter((c): c is CollectionCoffeeItem => c !== null);
}

// ── Social: Follow Lists ──────────────────────────────────────────────────

export type FollowUser = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

export async function getFollowersList(
  supabase: Supabase,
  userId: string
): Promise<FollowUser[]> {
  // People who follow userId: following_id = userId → get their follower_id values
  const { data: follows } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", userId)
    .order("created_at", { ascending: false });

  if (!follows || follows.length === 0) return [];

  const ids = follows.map((f) => f.follower_id);
  const { data: users } = await supabase
    .from("users")
    .select("id, username, display_name, avatar_url")
    .in("id", ids);

  const map = new Map((users ?? []).map((u) => [u.id, u]));
  return ids.map((id) => map.get(id)).filter((u): u is FollowUser => !!u);
}

export async function getFollowingList(
  supabase: Supabase,
  userId: string
): Promise<FollowUser[]> {
  // People userId follows: follower_id = userId → get their following_id values
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId)
    .order("created_at", { ascending: false });

  if (!follows || follows.length === 0) return [];

  const ids = follows.map((f) => f.following_id);
  const { data: users } = await supabase
    .from("users")
    .select("id, username, display_name, avatar_url")
    .in("id", ids);

  const map = new Map((users ?? []).map((u) => [u.id, u]));
  return ids.map((id) => map.get(id)).filter((u): u is FollowUser => !!u);
}

export async function searchUsers(
  supabase: Supabase,
  query: string,
  limit = 20
): Promise<FollowUser[]> {
  if (!query.trim()) return [];

  const safe = query.replace(/[%_]/g, "").trim();
  if (!safe) return [];

  const { data } = await supabase
    .from("users")
    .select("id, username, display_name, avatar_url")
    .or(`username.ilike.%${safe}%,display_name.ilike.%${safe}%`)
    .limit(limit);

  return (data ?? []) as FollowUser[];
}

export async function getSuggestedUsers(
  supabase: Supabase,
  currentUserId: string,
  limit = 6
): Promise<FollowUser[]> {
  // Get coffee IDs the current user has reviewed
  const { data: myEntries } = await supabase
    .from("coffee_entries")
    .select("coffee_id")
    .eq("user_id", currentUserId);

  const myCoffeeIds = (myEntries ?? []).map((e) => e.coffee_id);

  // Get IDs of users already followed
  const { data: following } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", currentUserId);

  const followingIds = (following ?? []).map((f) => f.following_id);
  // Always exclude self
  const excludeIds = [...followingIds, currentUserId];

  let query = supabase
    .from("users")
    .select("id, username, display_name, avatar_url")
    .not("id", "in", `(${excludeIds.join(",")})`)
    .limit(limit);

  if (myCoffeeIds.length > 0) {
    // Users who share at least one coffee in common
    const { data: commonReviewers } = await supabase
      .from("coffee_entries")
      .select("user_id")
      .in("coffee_id", myCoffeeIds)
      .not("user_id", "in", `(${excludeIds.join(",")})`);

    const candidateIds = [
      ...new Set((commonReviewers ?? []).map((r) => r.user_id)),
    ].slice(0, limit * 3);

    if (candidateIds.length > 0) {
      query = supabase
        .from("users")
        .select("id, username, display_name, avatar_url")
        .in("id", candidateIds)
        .limit(limit);
    }
  }

  const { data } = await query;
  return (data ?? []) as FollowUser[];
}

// ── Brand Hub ─────────────────────────────────────────────────────────────

export type BrandStats = {
  total_coffees: number;
  total_reviews: number;
  avg_rating: number | null;
  top_origin: string | null;
  top_flavor_tags: string[];
};

export async function getBrandCoffees(
  supabase: Supabase,
  brandSlug: string,
  limit = 50
): Promise<Coffee[]> {
  const { data, error } = await supabase
    .from("coffees")
    .select("*")
    .eq("brand_slug", brandSlug)
    .order("avg_rating", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) {
    console.error("getBrandCoffees error:", error);
    return [];
  }
  return ((data ?? []) as unknown) as Coffee[];
}

export async function getBrandStats(
  supabase: Supabase,
  brandSlug: string
): Promise<BrandStats> {
  const { data: coffees } = await supabase
    .from("coffees")
    .select("id, avg_rating, total_reviews, origin")
    .eq("brand_slug", brandSlug);

  const rows = coffees ?? [];
  const total_coffees = rows.length;
  const total_reviews = rows.reduce((sum, c) => sum + (c.total_reviews ?? 0), 0);

  const ratingsWithValues = rows
    .map((c) => c.avg_rating)
    .filter((r): r is number => r !== null);
  const avg_rating =
    ratingsWithValues.length > 0
      ? Math.round(
          (ratingsWithValues.reduce((s, r) => s + r, 0) / ratingsWithValues.length) * 10
        ) / 10
      : null;

  // Most common origin
  const originCounts: Record<string, number> = {};
  for (const c of rows) {
    if (c.origin) originCounts[c.origin] = (originCounts[c.origin] ?? 0) + 1;
  }
  const top_origin =
    Object.entries(originCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Top flavor tags across all coffees of this brand
  const coffeeIds = rows.map((c) => c.id);
  let top_flavor_tags: string[] = [];
  if (coffeeIds.length > 0) {
    const { data: flavors } = await supabase
      .from("coffee_flavor_stats")
      .select("tag, mention_count")
      .in("coffee_id", coffeeIds);

    const tagTotals: Record<string, number> = {};
    for (const f of flavors ?? []) {
      tagTotals[f.tag] = (tagTotals[f.tag] ?? 0) + (f.mention_count as number);
    }
    top_flavor_tags = Object.entries(tagTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  return { total_coffees, total_reviews, avg_rating, top_origin, top_flavor_tags };
}

export async function getActiveBrands(
  supabase: Supabase,
  minReviews = 1,
  limit = 12
): Promise<{ brand: string; slug: string; coffee_count: number; total_reviews: number }[]> {
  const { data, error } = await supabase
    .from("coffees")
    .select("brand, total_reviews")
    .gte("total_reviews", minReviews);

  if (error || !data) return [];

  const brandMap: Record<string, { coffee_count: number; total_reviews: number }> = {};
  for (const row of data) {
    if (!row.brand) continue;
    const existing = brandMap[row.brand];
    if (existing) {
      existing.coffee_count += 1;
      existing.total_reviews += row.total_reviews ?? 0;
    } else {
      brandMap[row.brand] = {
        coffee_count: 1,
        total_reviews: row.total_reviews ?? 0,
      };
    }
  }

  return Object.entries(brandMap)
    .map(([brand, stats]) => ({
      brand,
      slug: brandToSlug(brand),
      ...stats,
    }))
    .sort((a, b) => b.total_reviews - a.total_reviews)
    .slice(0, limit);
}

// ── Explore: Editorial ────────────────────────────────────────────────────

export type TrendingCoffee = {
  id: string;
  name: string;
  brand: string;
  type: CoffeeType;
  origin: string | null;
  roast_level: RoastLevel | null;
  image_url: string | null;
  avg_rating: number | null;
  total_reviews: number;
  created_at: string;
  recent_reviews_7d: number;
  score: number;
};

export async function getTrendingWithScore(
  supabase: Supabase,
  limit = 6
): Promise<TrendingCoffee[]> {
  const { data, error } = await supabase
    .from("coffee_trending_score")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getTrendingWithScore error:", error);
    return [];
  }
  return (data ?? []) as TrendingCoffee[];
}

export async function getCoffeeCountByOrigin(
  supabase: Supabase
): Promise<{ origin: string; count: number }[]> {
  const { data, error } = await supabase
    .from("coffees")
    .select("origin")
    .not("origin", "is", null);

  if (error || !data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    if (row.origin) {
      counts[row.origin] = (counts[row.origin] ?? 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([origin, count]) => ({ origin, count }))
    .sort((a, b) => b.count - a.count);
}
