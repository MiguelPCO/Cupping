import { Coffee } from "lucide-react";
import { getBrewMethodLabel } from "@/lib/utils";
import type { BrewMethod } from "@/types/coffee";

interface BrewMethodIconProps {
  method: BrewMethod;
  className?: string;
}

// Simple text label with a coffee icon fallback — icons can be swapped for custom SVGs later
export function BrewMethodIcon({ method, className }: BrewMethodIconProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs text-espresso-light ${className ?? ""}`}>
      <Coffee className="size-3.5 shrink-0" aria-hidden="true" />
      {getBrewMethodLabel(method)}
    </span>
  );
}
