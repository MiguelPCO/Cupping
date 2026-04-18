"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardStats } from "@/lib/hooks/use-dashboard-stats";

interface ReviewTimelineProps {
  data: DashboardStats["reviewTimeline"];
}

export function ReviewTimeline({ data }: ReviewTimelineProps) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-white rounded-xl border border-parchment p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-espresso">
          Actividad — últimos 12 meses
        </h3>
        <span className="font-mono text-xs text-parchment">
          {total} reseñas
        </span>
      </div>
      <div className="h-36" aria-label="Gráfica de actividad mensual">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <defs>
              <linearGradient id="timeline-fill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-copper-300)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-copper-300)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "var(--color-parchment)" }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--color-parchment)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "white",
                border: "1px solid var(--color-parchment)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => [typeof value === "number" ? value : 0, "reseñas"]}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-copper-500)"
              strokeWidth={2}
              fill="url(#timeline-fill)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-copper-500)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
