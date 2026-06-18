import type { Metadata } from "next";
import { CoffeeForm } from "@/components/coffee";
import { BackButton } from "@/components/ui/back-button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Coffee } from "@/types/coffee";

export const metadata: Metadata = {
  title: "Nueva reseña — CUPPING",
};

interface Props {
  searchParams: Promise<{ coffeeId?: string }>;
}

export default async function NewCoffeePage({ searchParams }: Props) {
  const { coffeeId } = await searchParams;
  let preselectedCoffee: Coffee | null = null;

  if (coffeeId) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("coffees")
      .select("*")
      .eq("id", coffeeId)
      .maybeSingle();
    preselectedCoffee = (data as Coffee | null) ?? null;
  }

  return (
    <div className="min-h-full bg-cream">
      <div className="max-w-xl mx-auto px-4 pt-5">
        <BackButton label="Cancelar" />
      </div>
      <CoffeeForm mode="create" preselectedCoffee={preselectedCoffee} />
    </div>
  );
}
