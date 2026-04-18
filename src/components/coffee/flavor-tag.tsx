"use client";

import { cn } from "@/lib/utils";
import type { FlavorTag as FlavorTagType } from "@/types/coffee";

const FLAVOR_LABELS: Record<string, string> = {
  chocolate: "Chocolate", nutty: "Nuez", fruity: "Frutal",
  floral: "Floral", citrus: "Cítrico", spicy: "Especiado",
  herbal: "Herbal", sweet: "Dulce", earthy: "Terroso",
  smoky: "Ahumado", vanilla: "Vainilla", honey: "Miel",
  berry: "Berry", tropical: "Tropical", wine: "Vinoso",
};

interface FlavorTagProps {
  flavor: FlavorTagType;
  selected?: boolean;
  onToggle?: (flavor: FlavorTagType) => void;
  size?: "sm" | "md";
  className?: string;
}

export function FlavorTag({ flavor, selected = false, onToggle, size = "md", className }: FlavorTagProps) {
  const isInteractive = !!onToggle;
  return (
    <button type="button" data-flavor={flavor}
      disabled={!isInteractive} onClick={() => onToggle?.(flavor)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full transition-all duration-150",
        size === "sm" && "px-2.5 py-1 text-xs",
        size === "md" && "px-3 py-1.5 text-sm",
        isInteractive && "cursor-pointer hover:scale-105 active:scale-95",
        !isInteractive && "cursor-default",
        selected && "ring-2 ring-[var(--flavor-color)] ring-offset-1 ring-offset-cream",
        className
      )}
      style={{
        backgroundColor: "color-mix(in oklch, var(--flavor-color) 15%, transparent)",
        color: "var(--flavor-color)",
        fontWeight: 500,
      }}
      aria-pressed={isInteractive ? selected : undefined}
      aria-label={`${FLAVOR_LABELS[flavor] ?? flavor}${selected ? " (seleccionado)" : ""}`}>
      <span className="size-2 rounded-full shrink-0"
        style={{ backgroundColor: "var(--flavor-color)" }} aria-hidden="true" />
      {FLAVOR_LABELS[flavor] ?? flavor}
    </button>
  );
}

interface FlavorTagGroupProps {
  selected: FlavorTagType[];
  onChange: (tags: FlavorTagType[]) => void;
  flavors?: FlavorTagType[];
  size?: "sm" | "md";
  className?: string;
}

export function FlavorTagGroup({ selected, onChange, flavors, size = "md", className }: FlavorTagGroupProps) {
  const displayFlavors: FlavorTagType[] = flavors ?? [
    "chocolate", "nutty", "fruity", "floral", "citrus",
    "spicy", "herbal", "sweet", "earthy", "smoky",
  ];

  const handleToggle = (flavor: FlavorTagType) => {
    onChange(selected.includes(flavor)
      ? selected.filter((f) => f !== flavor)
      : [...selected, flavor]);
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="group" aria-label="Notas de sabor">
      {displayFlavors.map((flavor) => (
        <FlavorTag key={flavor} flavor={flavor}
          selected={selected.includes(flavor)} onToggle={handleToggle} size={size} />
      ))}
    </div>
  );
}
