export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coffees: {
        Row: {
          id: string
          name: string
          brand: string
          type: Database["public"]["Enums"]["coffee_type"]
          origin: string | null
          roast_level: Database["public"]["Enums"]["roast_level"] | null
          image_url: string | null
          avg_rating: number | null
          total_reviews: number
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          brand: string
          type: Database["public"]["Enums"]["coffee_type"]
          origin?: string | null
          roast_level?: Database["public"]["Enums"]["roast_level"] | null
          image_url?: string | null
          avg_rating?: number | null
          total_reviews?: number
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string
          type?: Database["public"]["Enums"]["coffee_type"]
          origin?: string | null
          roast_level?: Database["public"]["Enums"]["roast_level"] | null
          image_url?: string | null
          avg_rating?: number | null
          total_reviews?: number
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coffees_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      coffee_entries: {
        Row: {
          id: string
          user_id: string
          coffee_id: string
          rating_global: number
          rating_aroma: number | null
          rating_body: number | null
          rating_acidity: number | null
          rating_sweetness: number | null
          rating_bitterness: number | null
          rating_aftertaste: number | null
          notes: string | null
          photo_url: string | null
          brew_method: Database["public"]["Enums"]["brew_method"] | null
          visibility: Database["public"]["Enums"]["entry_visibility"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coffee_id: string
          rating_global: number
          rating_aroma?: number | null
          rating_body?: number | null
          rating_acidity?: number | null
          rating_sweetness?: number | null
          rating_bitterness?: number | null
          rating_aftertaste?: number | null
          notes?: string | null
          photo_url?: string | null
          brew_method?: Database["public"]["Enums"]["brew_method"] | null
          visibility?: Database["public"]["Enums"]["entry_visibility"] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coffee_id?: string
          rating_global?: number
          rating_aroma?: number | null
          rating_body?: number | null
          rating_acidity?: number | null
          rating_sweetness?: number | null
          rating_bitterness?: number | null
          rating_aftertaste?: number | null
          notes?: string | null
          photo_url?: string | null
          brew_method?: Database["public"]["Enums"]["brew_method"] | null
          visibility?: Database["public"]["Enums"]["entry_visibility"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coffee_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coffee_entries_coffee_id_fkey"
            columns: ["coffee_id"]
            isOneToOne: false
            referencedRelation: "coffees"
            referencedColumns: ["id"]
          }
        ]
      }
      entry_flavor_tags: {
        Row: {
          id: string
          entry_id: string
          tag: Database["public"]["Enums"]["flavor_tag"]
        }
        Insert: {
          id?: string
          entry_id: string
          tag: Database["public"]["Enums"]["flavor_tag"]
        }
        Update: {
          id?: string
          entry_id?: string
          tag?: Database["public"]["Enums"]["flavor_tag"]
        }
        Relationships: [
          {
            foreignKeyName: "entry_flavor_tags_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "coffee_entries"
            referencedColumns: ["id"]
          }
        ]
      }
      collections: {
        Row: {
          id: string
          user_id: string
          name: string
          type: Database["public"]["Enums"]["collection_type"]
          icon: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: Database["public"]["Enums"]["collection_type"]
          icon?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: Database["public"]["Enums"]["collection_type"]
          icon?: string | null
          is_default?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      collection_items: {
        Row: {
          id: string
          collection_id: string
          coffee_id: string
          added_at: string
        }
        Insert: {
          id?: string
          collection_id: string
          coffee_id: string
          added_at?: string
        }
        Update: {
          id?: string
          collection_id?: string
          coffee_id?: string
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_coffee_id_fkey"
            columns: ["coffee_id"]
            isOneToOne: false
            referencedRelation: "coffees"
            referencedColumns: ["id"]
          }
        ]
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      entry_likes: {
        Row: {
          entry_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          entry_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          entry_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_likes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "coffee_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      coffee_flavor_stats: {
        Row: {
          tag: string
          coffee_id: string
          mention_count: number
        }
        Relationships: []
      }
      coffee_brew_stats: {
        Row: {
          brew_method: string
          coffee_id: string
          usage_count: number
        }
        Relationships: []
      }
      coffee_subrating_avgs: {
        Row: {
          coffee_id: string
          avg_aroma: number | null
          avg_body: number | null
          avg_acidity: number | null
          avg_sweetness: number | null
          avg_bitterness: number | null
          avg_aftertaste: number | null
        }
        Relationships: []
      }
      coffee_rating_distribution: {
        Row: {
          coffee_id: string
          bucket: number
          count: number
        }
        Relationships: []
      }
      coffee_trending_score: {
        Row: {
          id: string;
          name: string;
          brand: string;
          type: Database["public"]["Enums"]["coffee_type"];
          origin: string | null;
          roast_level: Database["public"]["Enums"]["roast_level"] | null;
          image_url: string | null;
          avg_rating: number | null;
          total_reviews: number;
          created_at: string;
          recent_reviews_7d: number;
          score: number;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      coffee_type: "bean" | "ground" | "capsule" | "instant" | "cold_brew"
      roast_level: "light" | "medium" | "medium_dark" | "dark"
      brew_method:
        | "espresso"
        | "pour_over"
        | "french_press"
        | "aeropress"
        | "moka"
        | "drip"
        | "cold_brew"
        | "capsule_machine"
      flavor_tag:
        | "chocolate"
        | "nutty"
        | "fruity"
        | "floral"
        | "citrus"
        | "spicy"
        | "herbal"
        | "sweet"
        | "earthy"
        | "smoky"
        | "vanilla"
        | "honey"
        | "berry"
        | "tropical"
        | "wine"
      collection_type: "at_home" | "favorites" | "to_try" | "tried"
      entry_visibility: "public" | "private"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
