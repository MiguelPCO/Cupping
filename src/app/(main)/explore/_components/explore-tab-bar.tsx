import Link from "next/link";
import { cn } from "@/lib/utils";

interface ExploreTabBarProps {
  activeTab: string;
}

export function ExploreTabBar({ activeTab }: ExploreTabBarProps) {
  return (
    <div className="flex gap-1 border-b border-parchment mb-6">
      <Link
        href="/explore"
        className={cn(
          "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
          activeTab === "cafes"
            ? "border-copper-500 text-espresso"
            : "border-transparent text-espresso-light hover:text-espresso"
        )}
      >
        Cafés
      </Link>
      <Link
        href="/explore?tab=personas"
        className={cn(
          "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
          activeTab === "personas"
            ? "border-copper-500 text-espresso"
            : "border-transparent text-espresso-light hover:text-espresso"
        )}
      >
        Personas
      </Link>
    </div>
  );
}
