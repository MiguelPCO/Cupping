import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type {
  ActivityItem,
  CoffeeEntryWithCoffee,
  CoffeeType,
  BrewMethod,
  FlavorTag,
  RoastLevel,
} from "@/types/coffee";

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
  limit?: number
): Promise<CoffeeEntryWithCoffee[]> {
  let query = supabase
    .from("coffee_entries")
    .select(ENTRY_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

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
