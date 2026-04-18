"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const COLLECTIONS_KEY = (userId: string) =>
  ["collections", userId] as const;

export function useCollections(userId: string) {
  return useQuery({
    queryKey: COLLECTIONS_KEY(userId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", userId)
        .order("created_at");

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 10 * 60_000,
  });
}

export function useAddToCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      collectionId,
      coffeeId,
    }: {
      collectionId: string;
      coffeeId: string;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("collection_items")
        .insert({ collection_id: collectionId, coffee_id: coffeeId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useRemoveFromCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      collectionId,
      coffeeId,
    }: {
      collectionId: string;
      coffeeId: string;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("collection_items")
        .delete()
        .eq("collection_id", collectionId)
        .eq("coffee_id", coffeeId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
