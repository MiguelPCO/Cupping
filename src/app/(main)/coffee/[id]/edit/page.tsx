import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEntryById } from "@/lib/supabase/queries";
import { CoffeeForm } from "@/components/coffee";
import type { CoffeeFormInput } from "@/lib/validations/coffee";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Editar reseña — CUPPING",
};

export default async function EditCoffeePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const entry = await getEntryById(supabase, id);
  if (!entry) notFound();
  if (entry.user_id !== user.id) redirect(`/coffee/${id}`);

  const defaultValues: CoffeeFormInput = {
    name: entry.coffee.name,
    brand: entry.coffee.brand,
    type: entry.coffee.type,
    origin: entry.coffee.origin ?? undefined,
    roast_level: entry.coffee.roast_level ?? undefined,
    rating_global: entry.rating_global,
    rating_aroma: entry.rating_aroma ?? undefined,
    rating_body: entry.rating_body ?? undefined,
    rating_acidity: entry.rating_acidity ?? undefined,
    rating_sweetness: entry.rating_sweetness ?? undefined,
    rating_bitterness: entry.rating_bitterness ?? undefined,
    rating_aftertaste: entry.rating_aftertaste ?? undefined,
    flavor_tags: entry.flavor_tags,
    notes: entry.notes ?? undefined,
    brew_method: entry.brew_method ?? undefined,
    photo_url: entry.photo_url ?? undefined,
  };

  return (
    <div className="min-h-full bg-cream">
      <CoffeeForm mode="edit" defaultValues={defaultValues} entryId={id} />
    </div>
  );
}
