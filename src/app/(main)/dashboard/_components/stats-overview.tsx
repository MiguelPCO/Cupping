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
        "rounded-xl border p-4 flex flex-col",
        accent
          ? "bg-espresso border-espresso text-white"
          : "bg-card border-parchment"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center size-8 rounded-lg shrink-0 mb-3",
          accent ? "bg-white/10" : "bg-linen"
        )}
      >
        {icon}
      </div>
      <p
        className={cn(
          "text-[10px] font-medium uppercase tracking-[0.08em] leading-tight",
          accent ? "text-white/50" : "text-copper-400"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "font-mono text-[1.6rem] font-semibold leading-none mt-1 tabular-nums",
          accent ? "text-white" : "text-espresso"
        )}
      >
        {value}
      </p>
      {sub && (
        <p
          className={cn(
            "text-[11px] mt-1.5 flex items-center gap-1",
            accent ? "text-white/60" : "text-parchment"
          )}
        >
          {accent && (
            <span className="inline-block size-1.5 rounded-full bg-copper-300 shrink-0" />
          )}
          {sub}
        </p>
      )}
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
        icon={<Coffee className="size-4 text-copper-500" />}
        label="Cafés registrados"
        value={String(stats.totalCoffees)}
        sub="cafés únicos"
      />
      <StatCard
        icon={<Star className="size-4 text-copper-500" />}
        label="Puntuación media"
        value={
          stats.totalCoffees > 0 ? stats.avgRating.toFixed(1) : "—"
        }
        sub="sobre 5.0"
      />
      <StatCard
        icon={<CalendarDays className="size-4 text-copper-500" />}
        label="Esta semana"
        value={String(stats.thisWeekCount)}
        sub="nuevas reseñas"
      />
      <StatCard
        icon={<Zap className="size-4 text-white" />}
        label="Racha actual"
        value={`${stats.currentStreak}d`}
        sub={stats.currentStreak > 0 ? "¡sigue así!" : "empieza hoy"}
        accent={stats.currentStreak >= 3}
      />
    </div>
  );
}
