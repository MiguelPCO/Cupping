"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getActivityFeed } from "@/lib/supabase/queries";
import { useCurrentUser } from "@/lib/hooks/use-auth";

const PAGE_SIZE = 10;

export function useActivityFeed(userId: string) {
  return useInfiniteQuery({
    queryKey: ["activity_feed", userId],
    queryFn: async ({ pageParam = 0 }) => {
      const supabase = createClient();
      return getActivityFeed(supabase, userId, pageParam as number, PAGE_SIZE);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}

const LAST_DASHBOARD_VISIT_KEY = "cupping:last_dashboard_visit";

export function markDashboardVisited(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LAST_DASHBOARD_VISIT_KEY, new Date().toISOString());
  }
}

export function useUnreadActivityCount(): number {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.user?.id ?? "";
  const { data } = useActivityFeed(userId);

  const allItems = data?.pages.flatMap((p) => p) ?? [];

  if (typeof window === "undefined" || !currentUser?.user?.id) return 0;

  const lastVisit = localStorage.getItem(LAST_DASHBOARD_VISIT_KEY);
  if (!lastVisit) return allItems.length;

  return allItems.filter(
    (item) => new Date(item.created_at) > new Date(lastVisit)
  ).length;
}
