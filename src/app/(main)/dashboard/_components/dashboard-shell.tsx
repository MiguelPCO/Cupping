"use client";

import { useCoffeeEntries } from "@/lib/hooks";
import { capitalize } from "@/lib/utils";
import { useDashboardStats } from "@/lib/hooks/use-dashboard-stats";
import { CoffeeCardSkeleton } from "@/components/coffee";
import { StatsOverview } from "./stats-overview";
import { RatingDistribution } from "./rating-distribution";
import { ReviewTimeline } from "./review-timeline";
import { TopItemsList } from "./top-items-list";
import { CollectionCounters } from "./collection-counters";
import { FilteredEntryGrid } from "./filtered-entry-grid";
import { FlavorWheel } from "@/components/coffee/flavor-wheel";
import { ActivityFeed } from "./activity-feed";

interface CollectionRow {
  id: string;
  type: string;
  name: string;
}

interface DashboardShellProps {
  userId: string;
  firstName: string;
  collections: CollectionRow[];
  itemCounts: Record<string, number>;
}

export function DashboardShell({
  userId,
  firstName,
  collections,
  itemCounts,
}: DashboardShellProps) {
  const { data: entries = [], isLoading } = useCoffeeEntries(userId);
  const stats = useDashboardStats(entries);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl text-espresso">
          Hola, {capitalize(firstName)}
        </h1>
        <p className="text-espresso-light text-sm mt-1">
          {entries.length === 0
            ? "Empieza a registrar tus cafés"
            : `${entries.length} reseña${entries.length !== 1 ? "s" : ""} en tu colección`}
        </p>
      </div>

      {/* KPI cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-parchment animate-pulse" />
          ))}
        </div>
      ) : (
        <StatsOverview stats={stats} />
      )}

      {/* Charts row */}
      {!isLoading && entries.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RatingDistribution data={stats.ratingDistribution} />
            <FlavorWheel data={stats.flavorFamilyData} />
          </div>

          {/* Timeline */}
          <ReviewTimeline data={stats.reviewTimeline} />

          {/* Top brands + origins */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TopItemsList
              title="Marcas favoritas"
              items={stats.topBrands}
              emptyText="Aún no hay suficientes datos"
            />
            <TopItemsList
              title="Orígenes"
              items={stats.topOrigins}
              emptyText="Añade el origen a tus reseñas"
            />
          </div>
        </>
      )}

      {/* Collection counters */}
      <CollectionCounters collections={collections} itemCounts={itemCounts} />

      {/* Divider */}
      <div className="border-t border-parchment" />

      {/* Entry grid with search + filters */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CoffeeCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <FilteredEntryGrid entries={entries} userId={userId} />
      )}

      {/* Activity feed from followed users */}
      <div className="border-t border-parchment pt-6">
        <h2 className="font-display text-xl text-espresso mb-4">
          Actividad de la comunidad
        </h2>
        <ActivityFeed userId={userId} />
      </div>
    </div>
  );
}
