"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { followUser, unfollowUser } from "@/lib/actions/social";

export function useIsFollowing(
  targetId: string,
  currentUserId: string | undefined
) {
  return useQuery({
    queryKey: ["is_following", targetId],
    queryFn: async () => {
      if (!currentUserId) return false;
      const supabase = createClient();
      const { data } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", currentUserId)
        .eq("following_id", targetId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!currentUserId && !!targetId,
  });
}

export function useFollowToggle(
  targetId: string,
  targetUsername: string,
  isFollowing: boolean
) {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["is_following", targetId] });
    qc.invalidateQueries({ queryKey: ["follow_counts", targetId] });
    qc.invalidateQueries({ queryKey: ["profile", targetUsername] });
  };

  const follow = useMutation({
    mutationFn: () => followUser(targetId),
    onSuccess: invalidate,
  });

  const unfollow = useMutation({
    mutationFn: () => unfollowUser(targetId),
    onSuccess: invalidate,
  });

  return isFollowing ? unfollow : follow;
}
