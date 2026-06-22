"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getSuggestedUsers } from "@/lib/supabase/queries";
import { useCurrentUser } from "@/lib/hooks/use-auth";
import type { FollowUser } from "@/lib/supabase/queries";

export function useSuggestedUsers(limit = 6) {
  const { data: currentUser } = useCurrentUser();
  const supabase = createClient();

  return useQuery<FollowUser[]>({
    queryKey: ["suggested-users", currentUser?.user?.id ?? ""],
    queryFn: () => getSuggestedUsers(supabase, currentUser!.user!.id, limit),
    enabled: !!currentUser?.user?.id,
    staleTime: 5 * 60 * 1000,
  });
}
