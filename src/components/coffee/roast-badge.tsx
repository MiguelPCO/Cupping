import { cn } from "@/lib/utils";
import { getRoastLabel } from "@/lib/utils";
import type { RoastLevel } from "@/types/coffee";

interface RoastBadgeProps {
  level: RoastLevel;
  className?: string;
}

const ROAST_CLASSES: Record<RoastLevel, string> = {
  light: "bg-roast-light",
  medium: "bg-roast-medium",
  medium_dark: "bg-roast-medium-dark",
  dark: "bg-roast-dark",
};

export function RoastBadge({ level, className }: RoastBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-white/90 backdrop-blur-sm",
        ROAST_CLASSES[level],
        className
      )}
    >
      {getRoastLabel(level)}
    </span>
  );
}
