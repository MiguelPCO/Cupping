"use client";

import { useMemo } from "react";
import { useFilterStore } from "@/lib/stores";
import type { CoffeeEntryWithCoffee } from "@/types/coffee";

export function useFilteredEntries(entries: CoffeeEntryWithCoffee[]) {
  const {
    search,
    coffeeType,
    roastLevel,
    minRating,
    flavorTags,
    sortBy,
    sortOrder,
  } = useFilterStore();

  return useMemo(() => {
    let result = entries;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.coffee.name.toLowerCase().includes(q) ||
          e.coffee.brand.toLowerCase().includes(q) ||
          (e.notes?.toLowerCase().includes(q) ?? false)
      );
    }

    if (coffeeType) {
      result = result.filter((e) => e.coffee.type === coffeeType);
    }

    if (roastLevel) {
      result = result.filter((e) => e.coffee.roast_level === roastLevel);
    }

    if (minRating !== null) {
      result = result.filter((e) => e.rating_global >= minRating);
    }

    if (flavorTags.length > 0) {
      // AND logic: entry must have ALL selected tags
      result = result.filter((e) =>
        flavorTags.every((tag) => e.flavor_tags.includes(tag))
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") cmp = a.created_at.localeCompare(b.created_at);
      else if (sortBy === "rating") cmp = a.rating_global - b.rating_global;
      else if (sortBy === "name")
        cmp = a.coffee.name.localeCompare(b.coffee.name);
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [entries, search, coffeeType, roastLevel, minRating, flavorTags, sortBy, sortOrder]);
}
