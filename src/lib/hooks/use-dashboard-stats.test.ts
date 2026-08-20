import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDashboardStats } from "./use-dashboard-stats";
import type { CoffeeEntryWithCoffee } from "@/types/coffee";

function makeEntry(overrides: Partial<CoffeeEntryWithCoffee> = {}): CoffeeEntryWithCoffee {
  return {
    id: crypto.randomUUID(),
    user_id: "user-1",
    coffee_id: "coffee-1",
    rating_global: 4,
    rating_aroma: null,
    rating_body: null,
    rating_acidity: null,
    rating_sweetness: null,
    rating_bitterness: null,
    rating_aftertaste: null,
    notes: null,
    photo_url: null,
    brew_method: null,
    visibility: "public",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    flavor_tags: [],
    coffee: {
      id: "coffee-1",
      name: "Yirgacheffe",
      brand: "Stumptown",
      type: "bean",
      origin: "Ethiopia",
      roast_level: "light",
      image_url: null,
      avg_rating: 4,
      total_reviews: 1,
      created_by: "user-1",
      created_at: new Date().toISOString(),
    },
    ...overrides,
  } as CoffeeEntryWithCoffee;
}

describe("useDashboardStats", () => {
  it("returns zeroed stats for an empty entry list", () => {
    const { result } = renderHook(() => useDashboardStats([]));
    expect(result.current.totalCoffees).toBe(0);
    expect(result.current.avgRating).toBe(0);
    expect(result.current.currentStreak).toBe(0);
  });

  it("counts unique coffees and averages ratings", () => {
    const entries = [
      makeEntry({ id: "e1", coffee_id: "c1", rating_global: 4 }),
      makeEntry({ id: "e2", coffee_id: "c1", rating_global: 2 }),
      makeEntry({ id: "e3", coffee_id: "c2", rating_global: 5 }),
    ];
    const { result } = renderHook(() => useDashboardStats(entries));
    expect(result.current.totalCoffees).toBe(2);
    expect(result.current.avgRating).toBeCloseTo((4 + 2 + 5) / 3);
  });

  it("buckets rating distribution to the nearest half point", () => {
    const entries = [
      makeEntry({ id: "e1", rating_global: 4.3 }),
      makeEntry({ id: "e2", rating_global: 4.4 }),
    ];
    const { result } = renderHook(() => useDashboardStats(entries));
    const bucket = result.current.ratingDistribution.find((b) => b.rating === "4.5");
    expect(bucket?.count).toBe(2);
  });

  it("computes sub-rating averages only from non-null values", () => {
    const entries = [
      makeEntry({ id: "e1", rating_aroma: 8 }),
      makeEntry({ id: "e2", rating_aroma: null }),
      makeEntry({ id: "e3", rating_aroma: 6 }),
    ];
    const { result } = renderHook(() => useDashboardStats(entries));
    const aroma = result.current.subRatingAverages.find((s) => s.subject === "Aroma");
    expect(aroma?.value).toBe(7);
  });

  it("counts a coffee in the flavor family radar if it has any matching tag", () => {
    const entries = [
      makeEntry({ id: "e1", flavor_tags: ["chocolate"] }),
      makeEntry({ id: "e2", flavor_tags: ["citrus"] }),
    ];
    const { result } = renderHook(() => useDashboardStats(entries));
    const choco = result.current.flavorFamilyData.find((f) => f.subject === "Choco");
    expect(choco?.count).toBe(1);
  });
});
