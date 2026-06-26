"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryFilters,
} from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getEntriesForUser } from "@/lib/supabase/queries";
import {
  createCoffeeEntry,
  updateCoffeeEntry,
  deleteCoffeeEntry,
} from "@/lib/actions/coffee";
import type { CoffeeFormInput } from "@/lib/validations/coffee";
import type { CoffeeEntryWithCoffee } from "@/types/coffee";

const ENTRIES_KEY = (userId: string) => ["coffee_entries", userId] as const;
const FILTER: QueryFilters = { queryKey: ["coffee_entries"] };

export function useCoffeeEntries(userId: string) {
  return useQuery({
    queryKey: ENTRIES_KEY(userId),
    queryFn: () => {
      const supabase = createClient();
      return getEntriesForUser(supabase, userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });
}

export function useCreateCoffeeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CoffeeFormInput) => {
      const result = await createCoffeeEntry(data);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coffee_entries"] });
    },
  });
}

export function useUpdateCoffeeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      entryId,
      data,
    }: {
      entryId: string;
      data: CoffeeFormInput;
    }) => {
      const result = await updateCoffeeEntry(entryId, data);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coffee_entries"] });
    },
  });
}

export function useDeleteCoffeeEntry(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: string) => {
      const result = await deleteCoffeeEntry(entryId);
      if (result.error) throw new Error(result.error);
    },
    onMutate: async (entryId) => {
      await qc.cancelQueries(FILTER);
      const previous = qc.getQueryData<CoffeeEntryWithCoffee[]>(
        ENTRIES_KEY(userId)
      );
      qc.setQueryData<CoffeeEntryWithCoffee[]>(
        ENTRIES_KEY(userId),
        (old) => old?.filter((e) => e.id !== entryId) ?? []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(ENTRIES_KEY(userId), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["coffee_entries"] });
    },
  });
}
