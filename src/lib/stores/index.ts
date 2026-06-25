import { create } from "zustand";
import type { CoffeeType, RoastLevel, FlavorTag, CollectionType } from "@/types/coffee";

// ══════ UI Store ══════
interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  addCoffeeModalOpen: boolean;
  searchOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setAddCoffeeModal: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  addCoffeeModalOpen: false,
  searchOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  setAddCoffeeModal: (open) => set({ addCoffeeModalOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));

// ══════ Filter Store ══════
interface FilterState {
  search: string;
  coffeeType: CoffeeType | null;
  roastLevel: RoastLevel | null;
  minRating: number | null;
  flavorTags: FlavorTag[];
  collection: CollectionType | null;
  sortBy: "date" | "rating" | "name";
  sortOrder: "asc" | "desc";
  setSearch: (search: string) => void;
  setCoffeeType: (type: CoffeeType | null) => void;
  setRoastLevel: (level: RoastLevel | null) => void;
  setMinRating: (rating: number | null) => void;
  toggleFlavorTag: (tag: FlavorTag) => void;
  setCollection: (collection: CollectionType | null) => void;
  setSortBy: (sortBy: "date" | "rating" | "name") => void;
  setSortOrder: (order: "asc" | "desc") => void;
  resetFilters: () => void;
}

const INITIAL_FILTERS = {
  search: "", coffeeType: null as CoffeeType | null,
  roastLevel: null as RoastLevel | null, minRating: null as number | null,
  flavorTags: [] as FlavorTag[], collection: null as CollectionType | null,
  sortBy: "date" as const, sortOrder: "desc" as const,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...INITIAL_FILTERS,
  setSearch: (search) => set({ search }),
  setCoffeeType: (coffeeType) => set({ coffeeType }),
  setRoastLevel: (roastLevel) => set({ roastLevel }),
  setMinRating: (minRating) => set({ minRating }),
  toggleFlavorTag: (tag) => set((s) => ({
    flavorTags: s.flavorTags.includes(tag)
      ? s.flavorTags.filter((t) => t !== tag) : [...s.flavorTags, tag],
  })),
  setCollection: (collection) => set({ collection }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  resetFilters: () => set(INITIAL_FILTERS),
}));
