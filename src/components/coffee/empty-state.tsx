import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex items-center justify-center size-16 rounded-full bg-linen mb-4">
        <Icon className="size-8 text-copper-400" />
      </div>
      <h3 className="font-display text-xl text-espresso mb-2">{title}</h3>
      <p className="text-espresso-light text-sm max-w-xs mb-6">{description}</p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center rounded-lg border text-sm font-medium transition-all h-8 px-2.5 border-copper-300 text-copper-600 hover:bg-copper-50"
          >
            {action.label}
          </Link>
        ) : (
          <Button
            variant="outline"
            onClick={action.onClick}
            className="border-copper-300 text-copper-600 hover:bg-copper-50"
          >
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
