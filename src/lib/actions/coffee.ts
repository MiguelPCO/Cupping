"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  coffeeFormSchema,
  type CoffeeFormInput,
} from "@/lib/validations/coffee";

type ActionResult<T = undefined> =
  | { data: T; error?: never }
  | { error: string; data?: never };

export async function createCoffeeEntry(
  input: CoffeeFormInput
): Promise<ActionResult<{ entryId: string }>> {
  const parsed = coffeeFormSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos" };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const {
    name,
    brand,
    type,
    origin,
    roast_level,
    rating_global,
    rating_aroma,
    rating_body,
    rating_acidity,
    rating_sweetness,
    rating_bitterness,
    rating_aftertaste,
    flavor_tags,
    notes,
    brew_method,
    photo_url,
  } = parsed.data;

  // Find existing coffee or create new one
  let coffeeId: string;
  const { data: existing } = await supabase
    .from("coffees")
    .select("id")
    .eq("name", name)
    .eq("brand", brand)
    .eq("type", type)
    .maybeSingle();

  if (existing) {
    coffeeId = existing.id;
  } else {
    const { data: newCoffee, error: coffeeError } = await supabase
      .from("coffees")
      .insert({
        name,
        brand,
        type,
        origin: origin ?? null,
        roast_level: roast_level ?? null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (coffeeError || !newCoffee) {
      return { error: "Error al guardar el café" };
    }
    coffeeId = newCoffee.id;
  }

  // Insert the entry
  const { data: entry, error: entryError } = await supabase
    .from("coffee_entries")
    .insert({
      user_id: user.id,
      coffee_id: coffeeId,
      rating_global,
      rating_aroma: rating_aroma ?? null,
      rating_body: rating_body ?? null,
      rating_acidity: rating_acidity ?? null,
      rating_sweetness: rating_sweetness ?? null,
      rating_bitterness: rating_bitterness ?? null,
      rating_aftertaste: rating_aftertaste ?? null,
      notes: notes ?? null,
      brew_method: brew_method ?? null,
      photo_url: photo_url ?? null,
    })
    .select("id")
    .single();

  if (entryError || !entry) return { error: "Error al guardar la reseña" };

  // Insert flavor tags
  if (flavor_tags.length > 0) {
    const { error: tagsError } = await supabase.from("entry_flavor_tags").insert(
      flavor_tags.map((tag) => ({ entry_id: entry.id, tag }))
    );
    if (tagsError) return { error: "Error al guardar las notas de sabor" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/collection");
  return { data: { entryId: entry.id } };
}

export async function updateCoffeeEntry(
  entryId: string,
  input: CoffeeFormInput
): Promise<ActionResult<{ entryId: string }>> {
  const parsed = coffeeFormSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos" };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Verify ownership
  const { data: existingEntry } = await supabase
    .from("coffee_entries")
    .select("id, user_id")
    .eq("id", entryId)
    .single();

  if (!existingEntry || existingEntry.user_id !== user.id) {
    return { error: "No autorizado" };
  }

  const {
    rating_global,
    rating_aroma,
    rating_body,
    rating_acidity,
    rating_sweetness,
    rating_bitterness,
    rating_aftertaste,
    flavor_tags,
    notes,
    brew_method,
    photo_url,
  } = parsed.data;

  const { error: updateError } = await supabase
    .from("coffee_entries")
    .update({
      rating_global,
      rating_aroma: rating_aroma ?? null,
      rating_body: rating_body ?? null,
      rating_acidity: rating_acidity ?? null,
      rating_sweetness: rating_sweetness ?? null,
      rating_bitterness: rating_bitterness ?? null,
      rating_aftertaste: rating_aftertaste ?? null,
      notes: notes ?? null,
      brew_method: brew_method ?? null,
      photo_url: photo_url ?? null,
    })
    .eq("id", entryId);

  if (updateError) return { error: "Error al actualizar la reseña" };

  // Replace flavor tags
  const { error: deleteTagsError } = await supabase
    .from("entry_flavor_tags")
    .delete()
    .eq("entry_id", entryId);

  if (deleteTagsError) return { error: "Error al actualizar las notas de sabor" };

  if (flavor_tags.length > 0) {
    const { error: insertTagsError } = await supabase
      .from("entry_flavor_tags")
      .insert(flavor_tags.map((tag) => ({ entry_id: entryId, tag })));

    if (insertTagsError) return { error: "Error al guardar las notas de sabor" };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/coffee/${entryId}`);
  return { data: { entryId } };
}

export async function deleteCoffeeEntry(
  entryId: string
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Verify ownership
  const { data: entry } = await supabase
    .from("coffee_entries")
    .select("id, user_id")
    .eq("id", entryId)
    .single();

  if (!entry || entry.user_id !== user.id) return { error: "No autorizado" };

  const { error } = await supabase
    .from("coffee_entries")
    .delete()
    .eq("id", entryId);

  if (error) return { error: "Error al eliminar la reseña" };

  revalidatePath("/dashboard");
  revalidatePath("/collection");
  return { data: undefined };
}
