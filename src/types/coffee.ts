/* ═══════════════════════════════════════════════════
   CUPPING — Domain Types
   Source of truth for all app data structures
   ═══════════════════════════════════════════════════ */

// ══════ ENUMS ══════

export const COFFEE_TYPES = [
  "bean",
  "ground",
  "capsule",
  "instant",
  "cold_brew",
] as const;
export type CoffeeType = (typeof COFFEE_TYPES)[number];

export const ROAST_LEVELS = [
  "light",
  "medium",
  "medium_dark",
  "dark",
] as const;
export type RoastLevel = (typeof ROAST_LEVELS)[number];

export const BREW_METHODS = [
  "espresso",
  "pour_over",
  "french_press",
  "aeropress",
  "moka",
  "drip",
  "cold_brew",
  "capsule_machine",
] as const;
export type BrewMethod = (typeof BREW_METHODS)[number];

export const FLAVOR_TAGS = [
  "chocolate",
  "nutty",
  "fruity",
  "floral",
  "citrus",
  "spicy",
  "herbal",
  "sweet",
  "earthy",
  "smoky",
  "vanilla",
  "honey",
  "berry",
  "tropical",
  "wine",
] as const;
export type FlavorTag = (typeof FLAVOR_TAGS)[number];

export const FLAVOR_FAMILIES: Record<string, FlavorTag[]> = {
  "Chocolate / Tostado": ["chocolate", "smoky", "earthy"],
  "Frutal / Berry": ["fruity", "berry", "tropical", "wine"],
  "Cítrico": ["citrus"],
  "Floral": ["floral"],
  "Herbal / Terroso": ["herbal", "earthy"],
  "Dulce / Nuez": ["sweet", "nutty", "vanilla", "honey", "caramel" as FlavorTag],
  "Especiado": ["spicy"],
};

export const COLLECTION_TYPES = [
  "at_home",
  "favorites",
  "to_try",
  "tried",
] as const;
export type CollectionType = (typeof COLLECTION_TYPES)[number];

// ══════ ENTITIES ══════

export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Coffee {
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
}

export interface CoffeeEntry {
  id: string;
  user_id: string;
  coffee_id: string;
  rating_global: number; // 1-5 (0.5 increments)
  rating_aroma: number | null; // 0-10
  rating_body: number | null;
  rating_acidity: number | null;
  rating_sweetness: number | null;
  rating_bitterness: number | null;
  rating_aftertaste: number | null;
  flavor_tags: FlavorTag[];
  notes: string | null;
  photo_url: string | null;
  brew_method: BrewMethod | null;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  type: CollectionType;
  icon: string | null;
  is_default: boolean;
  item_count: number;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

// ══════ COMPOSED TYPES ══════

/** Coffee entry with its associated coffee details */
export interface CoffeeEntryWithCoffee extends CoffeeEntry {
  coffee: Coffee;
}

/** User profile with stats */
export interface UserProfile extends User {
  total_reviews: number;
  total_coffees: number;
  followers_count: number;
  following_count: number;
  is_following?: boolean;
}

/** Activity feed item */
export interface ActivityItem {
  id: string;
  user: Pick<User, "id" | "username" | "display_name" | "avatar_url">;
  entry: CoffeeEntryWithCoffee;
  created_at: string;
}

// ══════ FORM TYPES ══════

export interface CoffeeFormData {
  name: string;
  brand: string;
  type: CoffeeType;
  origin?: string;
  roast_level?: RoastLevel;
  rating_global: number;
  rating_aroma?: number;
  rating_body?: number;
  rating_acidity?: number;
  rating_sweetness?: number;
  rating_bitterness?: number;
  rating_aftertaste?: number;
  flavor_tags: FlavorTag[];
  notes?: string;
  brew_method?: BrewMethod;
  photo?: File;
}
