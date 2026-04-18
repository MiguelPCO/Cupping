"use client";

import { Coffee, Star, CalendarDays, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/lib/hooks/use-dashboard-stats";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex items-start gap-3",
        accent
          ? "bg-copper-500 border-copper-500 text-white"
          : "bg-white border-parchment"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center size-10 rounded-lg shrink-0",
          accent ? "bg-white/20" : "bg-linen"
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "text-xs font-medium",
            accent ? "text-white/70" : "text-parchment"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "font-mono text-2xl font-semibold leading-tight tabular-nums",
            accent ? "text-white" : "text-espresso"
          )}
        >
          {value}
        </p>
        {sub && (
          <p
            className={cn(
              "text-xs mt-0.5",
              accent ? "text-white/60" : "text-parchment"
            )}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

interface StatsOverviewProps {
  stats: DashboardStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={<Coffee className="size-5 text-copper-500" />}
        label="Cafés registrados"
        value={String(stats.totalCoffees)}
        sub="cafés únicos"
      />
      <StatCard
        icon={<Star className="size-5 text-copper-500" />}
        label="Puntuación media"
        value={
          stats.totalCoffees > 0 ? stats.avgRating.toFixed(2) : "—"
        }
        sub="sobre 5.0"
      />
      <StatCard
        icon={<CalendarDays className="size-5 text-copper-500" />}
        label="Esta semana"
        value={String(stats.thisWeekCount)}
        sub="nuevas reseñas"
      />
      <StatCard
        icon={<Zap className="size-5 text-white" />}
        label="Racha actual"
        value={`${stats.currentStreak}d`}
        sub={stats.currentStreak > 0 ? "¡sigue así!" : "empieza hoy"}
        accent={stats.currentStreak >= 3}
      />
    </div>
  );
}
