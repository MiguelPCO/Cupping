import { cn } from "@/lib/utils";
import { getRoastLabel } from "@/lib/utils";
import type { RoastLevel } from "@/types/coffee";

interface RoastBadgeProps {
  level: RoastLevel;
  className?: string;
}

const ROAST_CLASSES: Record<RoastLevel, string> = {
  light: "bg-roast-light text-espresso",
  medium: "bg-roast-medium text-white/90",
  medium_dark: "bg-roast-medium-dark text-white/90",
  dark: "bg-roast-dark text-white/90",
};

export function RoastBadge({ level, className }: RoastBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium backdrop-blur-sm",
        ROAST_CLASSES[level],
        className
      )}
    >
      {getRoastLabel(level)}
    </span>
  );
}
