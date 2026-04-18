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

export function useFollowCounts(userId: string) {
  return useQuery({
    queryKey: ["follow_counts", userId],
    queryFn: async () => {
      const supabase = createClient();
      const [followers, following] = await Promise.all([
        supabase
          .from("follows")
          .select("follower_id", { count: "exact", head: true })
          .eq("following_id", userId),
        supabase
          .from("follows")
          .select("following_id", { count: "exact", head: true })
          .eq("follower_id", userId),
      ]);
      return {
        followers: followers.count ?? 0,
        following: following.count ?? 0,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
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
