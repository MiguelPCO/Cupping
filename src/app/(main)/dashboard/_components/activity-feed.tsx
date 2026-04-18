"use client";

import Link from "next/link";
import { User, ChevronDown, Loader2 } from "lucide-react";
import { useActivityFeed } from "@/lib/hooks/use-activity-feed";
import { RatingCups } from "@/components/coffee/rating-cups";
import { FlavorTag } from "@/components/coffee/flavor-tag";
import { timeAgo } from "@/lib/utils";

interface ActivityFeedProps {
  userId: string;
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useActivityFeed(userId);

  const items = data?.pages.flat() ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-parchment animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-parchment p-6 text-center">
        <p className="text-espresso-light text-sm">
          Sigue a otros usuarios para ver su actividad aquí.
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center justify-center mt-3 rounded-lg border border-copper-300 text-copper-600 text-xs font-medium px-3 py-1.5 hover:bg-copper-50 transition-colors"
        >
          Explorar comunidad
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl border border-parchment p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="size-7 rounded-full overflow-hidden bg-copper-100 flex items-center justify-center shrink-0">
              {item.user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.user.avatar_url}
                  alt={item.user.display_name}
                  className="size-full object-cover"
                />
              ) : (
                <User className="size-4 text-copper-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${item.user.username}`}
                className="text-xs font-medium text-espresso hover:underline"
              >
                {item.user.display_name}
              </Link>
              <span className="text-xs text-parchment ml-1">
                reseñó un café · {timeAgo(item.created_at)}
              </span>
            </div>
          </div>

          <Link href={`/coffee/${item.entry.id}`}>
            <div className="flex gap-3 group">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-espresso-light font-medium uppercase tracking-wide truncate">
                  {item.entry.coffee.brand}
                </p>
                <p className="font-display text-sm text-espresso leading-tight group-hover:text-copper-600 transition-colors truncate">
                  {item.entry.coffee.name}
                </p>
                <RatingCups
                  value={item.entry.rating_global}
                  readOnly
                  size="sm"
                />
                {item.entry.flavor_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {item.entry.flavor_tags.slice(0, 3).map((tag) => (
                      <FlavorTag key={tag} flavor={tag} size="sm" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-2 text-xs text-copper-600 hover:text-copper-700 flex items-center justify-center gap-1 transition-colors"
        >
          {isFetchingNextPage ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <>
              <ChevronDown className="size-3" />
              Ver más
            </>
          )}
        </button>
      )}
    </div>
  );
}
