"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getActivityFeed } from "@/lib/supabase/queries";

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
