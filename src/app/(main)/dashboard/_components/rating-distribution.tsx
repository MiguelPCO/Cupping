"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DashboardStats } from "@/lib/hooks/use-dashboard-stats";

interface RatingDistributionProps {
  data: DashboardStats["ratingDistribution"];
}

export function RatingDistribution({ data }: RatingDistributionProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-card rounded-xl border border-parchment p-4">
      <h3 className="text-sm font-medium text-espresso mb-4">
        Distribución de ratings
      </h3>
      <div className="h-40" aria-label="Gráfica de distribución de ratings">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <XAxis
              dataKey="rating"
              tick={{ fontSize: 10, fill: "var(--color-parchment)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--color-parchment)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--color-linen)" }}
              contentStyle={{
                background: "white",
                border: "1px solid var(--color-parchment)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => [typeof value === "number" ? value : 0, "reseñas"]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.rating}
                  fill={
                    entry.count === maxCount
                      ? "var(--color-copper-500)"
                      : "var(--color-copper-200)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
