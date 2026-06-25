"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useCoffeeEntries, useDeleteCoffeeEntry } from "@/lib/hooks";
import { capitalize } from "@/lib/utils";
import { useDashboardStats } from "@/lib/hooks/use-dashboard-stats";
import { CoffeeCard, CoffeeCardSkeleton } from "@/components/coffee";
import { StatsOverview } from "./stats-overview";
import { CollectionCounters } from "./collection-counters";
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function getDateLabel() {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

const RECENT_LIMIT = 4;

export function DashboardShell({
  userId,
  firstName,
  collections,
  itemCounts,
}: DashboardShellProps) {
  const router = useRouter();
  const { data: entries = [], isLoading } = useCoffeeEntries(userId);
  const deleteMutation = useDeleteCoffeeEntry(userId);
  const stats = useDashboardStats(entries);
  const recentEntries = entries.slice(0, RECENT_LIMIT);

  const handleEdit = (entryId: string) => router.push(`/coffee/${entryId}/edit`);

  const handleDelete = (entryId: string) => {
    if (!confirm("¿Eliminar esta reseña? Esta acción no se puede deshacer.")) return;
    deleteMutation.mutate(entryId, {
      onError: () => toast.error("No se pudo eliminar la reseña."),
    });
  };

  return (
    <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">
      {/* ── LEFT COLUMN ── */}
      <div className="space-y-8 min-w-0">
        {/* Greeting */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-copper-400 mb-1 capitalize">
            {getDateLabel()}
          </p>
          <h1 className="font-display text-3xl text-espresso leading-tight">
            {getGreeting()}, {capitalize(firstName)}
          </h1>
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

        {/* Collection counters */}
        <CollectionCounters collections={collections} itemCounts={itemCounts} />

        {/* Recent entries */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-copper-400">
              Entradas recientes
            </p>
            {entries.length > RECENT_LIMIT && (
              <Link
                href="/collection"
                className="flex items-center gap-1 text-xs font-medium text-copper-500 hover:text-copper-600 transition-colors"
              >
                Ver todas
                <ArrowRight className="size-3" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: RECENT_LIMIT }).map((_, i) => (
                <CoffeeCardSkeleton key={i} />
              ))}
            </div>
          ) : recentEntries.length === 0 ? (
            <div className="py-10 text-center rounded-xl border border-dashed border-parchment">
              <p className="font-display text-lg text-espresso mb-1">Sin entradas aún</p>
              <p className="text-sm text-espresso-light">Registra tu primer café para empezar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentEntries.map((entry, i) => (
                <CoffeeCard
                  key={entry.id}
                  entry={entry}
                  currentUserId={userId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  priority={i === 0}
                />
              ))}
            </div>
          )}

          {!isLoading && entries.length > RECENT_LIMIT && (
            <Link
              href="/collection"
              className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-parchment text-sm font-medium text-espresso-light hover:border-copper-300 hover:text-espresso transition-all"
            >
              Ver colección completa ({entries.length} entradas)
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="space-y-6 mt-8 lg:mt-0 lg:sticky lg:top-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-copper-400 mb-3">
            Comunidad
          </p>
          <ActivityFeed userId={userId} />
        </div>

        {!isLoading && entries.length > 0 && (
          <FlavorWheel data={stats.flavorFamilyData} />
        )}
      </div>
    </div>
  );
}
