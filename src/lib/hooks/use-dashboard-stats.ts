"use client";

import { useMemo } from "react";
import { FLAVOR_FAMILIES, FLAVOR_TAGS } from "@/types/coffee";
import type { FlavorTag, CoffeeEntryWithCoffee } from "@/types/coffee";

const FAMILY_SHORT: Record<string, string> = {
  "Chocolate / Tostado": "Choco",
  "Frutal / Berry": "Frutal",
  "Cítrico": "Cítrico",
  "Floral": "Floral",
  "Herbal / Terroso": "Herbal",
  "Dulce / Nuez": "Dulce",
  "Especiado": "Especiado",
};

const MONTH_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function computeStreak(entries: CoffeeEntryWithCoffee[]): number {
  const dateSet = new Set(entries.map((e) => e.created_at.slice(0, 10)));
  let streak = 0;
  const cur = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr = cur.toISOString().slice(0, 10);
    if (dateSet.has(dateStr)) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else {
      // grace: on day 0 (today) having nothing doesn't break the streak yet
      if (i === 0) {
        cur.setDate(cur.getDate() - 1);
      } else {
        break;
      }
    }
  }
  return streak;
}

export interface DashboardStats {
  totalCoffees: number;
  avgRating: number;
  thisWeekCount: number;
  currentStreak: number;
  ratingDistribution: { rating: string; count: number }[];
  topBrands: { label: string; count: number }[];
  topOrigins: { label: string; count: number }[];
  reviewTimeline: { month: string; count: number }[];
  subRatingAverages: { subject: string; value: number; fullMark: number }[];
  flavorFamilyData: { subject: string; count: number; fullMark: number }[];
}

function computeStats(entries: CoffeeEntryWithCoffee[]): DashboardStats {
  const n = entries.length;

  // Unique coffees
  const totalCoffees = new Set(entries.map((e) => e.coffee_id)).size;

  // Avg rating
  const avgRating =
    n > 0 ? entries.reduce((s, e) => s + e.rating_global, 0) / n : 0;

  // This week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekCount = entries.filter(
    (e) => new Date(e.created_at) >= oneWeekAgo
  ).length;

  // Streak
  const currentStreak = computeStreak(entries);

  // Rating distribution (0.5 to 5.0)
  const RATINGS = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
  const ratingDistribution = RATINGS.map((r) => ({
    rating: r.toFixed(1),
    count: entries.filter(
      (e) => Math.round(e.rating_global * 2) / 2 === r
    ).length,
  }));

  // Top brands
  const brandCount: Record<string, number> = {};
  entries.forEach((e) => {
    brandCount[e.coffee.brand] = (brandCount[e.coffee.brand] ?? 0) + 1;
  });
  const topBrands = Object.entries(brandCount)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top origins
  const originCount: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.coffee.origin) {
      originCount[e.coffee.origin] =
        (originCount[e.coffee.origin] ?? 0) + 1;
    }
  });
  const topOrigins = Object.entries(originCount)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Review timeline — last 12 months
  const now = new Date();
  const reviewTimeline = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const count = entries.filter((e) => {
      const ed = new Date(e.created_at);
      return ed.getFullYear() === year && ed.getMonth() === month;
    }).length;
    return {
      month: `${MONTH_ES[month]} ${String(year).slice(2)}`,
      count,
    };
  });

  // Sub-rating averages (radar chart)
  const subFields = [
    { key: "rating_aroma" as const, label: "Aroma" },
    { key: "rating_body" as const, label: "Cuerpo" },
    { key: "rating_acidity" as const, label: "Acidez" },
    { key: "rating_sweetness" as const, label: "Dulzor" },
    { key: "rating_bitterness" as const, label: "Amargor" },
    { key: "rating_aftertaste" as const, label: "Retrogusto" },
  ];
  const subRatingAverages = subFields.map(({ key, label }) => {
    const values = entries
      .map((e) => e[key])
      .filter((v): v is number => v !== null);
    return {
      subject: label,
      value:
        values.length > 0
          ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
          : 0,
      fullMark: 10,
    };
  });

  // Flavor family radar
  const flavorFamilyData = Object.entries(FLAVOR_FAMILIES).map(
    ([family, tags]) => {
      const validTags = tags.filter((t) =>
        (FLAVOR_TAGS as readonly string[]).includes(t)
      ) as FlavorTag[];
      const count = entries.filter((e) =>
        e.flavor_tags.some((t) => validTags.includes(t))
      ).length;
      return {
        subject: FAMILY_SHORT[family] ?? family,
        count,
        fullMark: Math.max(n, 1),
      };
    }
  );

  return {
    totalCoffees,
    avgRating,
    thisWeekCount,
    currentStreak,
    ratingDistribution,
    topBrands,
    topOrigins,
    reviewTimeline,
    subRatingAverages,
    flavorFamilyData,
  };
}

export function useDashboardStats(entries: CoffeeEntryWithCoffee[]) {
  return useMemo(() => computeStats(entries), [entries]);
}
