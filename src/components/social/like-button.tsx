"use client";

import { Heart, Loader2 } from "lucide-react";
import { useEntryLike } from "@/lib/hooks/use-like";
import { useCurrentUser } from "@/lib/hooks";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  entryId: string;
  className?: string;
}

export function LikeButton({ entryId, className }: LikeButtonProps) {
  const { data: auth } = useCurrentUser();
  const currentUserId = auth?.user?.id;
  const { count, isLiked, toggle, isPending } = useEntryLike(entryId, currentUserId);

  return (
    <button
      type="button"
      onClick={() => {
        if (!currentUserId) return;
        toggle();
      }}
      disabled={isPending || !currentUserId}
      aria-label={isLiked ? "Quitar me gusta" : "Me gusta"}
      aria-pressed={isLiked}
      className={cn(
        "flex items-center gap-1 text-xs transition-colors",
        isLiked
          ? "text-copper-500"
          : "text-parchment hover:text-copper-400",
        !currentUserId && "opacity-50 cursor-default",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Heart className={cn("size-3.5", isLiked && "fill-current")} />
      )}
      {count > 0 && <span className="font-mono">{count}</span>}
    </button>
  );
}
