"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { likeEntry, unlikeEntry } from "@/lib/actions/social";

type LikeState = { count: number; isLiked: boolean };

export function useEntryLike(
  entryId: string,
  currentUserId: string | undefined
) {
  const qc = useQueryClient();
  const queryKey = ["entry_like", entryId, currentUserId] as const;

  const { data } = useQuery<LikeState>({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const [countResult, likedResult] = await Promise.all([
        supabase
          .from("entry_likes")
          .select("user_id", { count: "exact", head: true })
          .eq("entry_id", entryId),
        currentUserId
          ? supabase
              .from("entry_likes")
              .select("user_id")
              .eq("entry_id", entryId)
              .eq("user_id", currentUserId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      return {
        count: countResult.count ?? 0,
        isLiked: !!likedResult.data,
      };
    },
    enabled: !!entryId,
    staleTime: 30_000,
  });

  const toggle = useMutation({
    mutationFn: () =>
      data?.isLiked ? unlikeEntry(entryId) : likeEntry(entryId),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<LikeState>(queryKey);
      qc.setQueryData<LikeState>(queryKey, (old) => {
        if (!old) return old;
        return {
          count: old.isLiked ? old.count - 1 : old.count + 1,
          isLiked: !old.isLiked,
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["entry_like", entryId] });
    },
  });

  return {
    count: data?.count ?? 0,
    isLiked: data?.isLiked ?? false,
    toggle: toggle.mutate,
    isPending: toggle.isPending,
  };
}
