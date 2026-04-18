"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface FlavorWheelProps {
  data: { subject: string; count: number; fullMark: number }[];
  className?: string;
}

export function FlavorWheel({ data, className }: FlavorWheelProps) {
  const isEmpty = data.every((d) => d.count === 0);

  return (
    <div
      className={`bg-white rounded-xl border border-parchment p-4 ${className ?? ""}`}
    >
      <h3 className="text-sm font-medium text-espresso mb-2">
        Rueda de sabores
      </h3>
      {isEmpty ? (
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-parchment">
            Añade notas de sabor a tus reseñas
          </p>
        </div>
      ) : (
        <div
          className="h-52"
          role="img"
          aria-label="Rueda de sabores personales"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
              <PolarGrid stroke="var(--color-parchment)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 10, fill: "var(--color-espresso-light)" }}
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
              <Radar
                dataKey="count"
                stroke="var(--color-copper-500)"
                strokeWidth={2}
                fill="var(--color-copper-500)"
                fillOpacity={0.2}
                dot={{ fill: "var(--color-copper-500)", r: 3 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
