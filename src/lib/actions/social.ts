"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ActionResult<T = void> =
  | { data: T; error?: never }
  | { error: string; data?: never };

const profileSchema = z.object({
  display_name: z.string().min(1, "Nombre requerido").max(100),
  username: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-z0-9_]+$/, "Solo letras minúsculas, números y guión bajo"),
  bio: z.string().max(300, "Máximo 300 caracteres").optional(),
});

export async function followUser(targetId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };
  if (user.id === targetId) return { error: "No puedes seguirte a ti mismo" };

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id: targetId });

  if (error) return { error: error.message };
  revalidatePath("/profile", "layout");
  return { data: undefined };
}

export async function unfollowUser(targetId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetId);

  if (error) return { error: error.message };
  revalidatePath("/profile", "layout");
  return { data: undefined };
}

export async function updateProfile(data: {
  display_name: string;
  username: string;
  bio?: string;
}): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Check username uniqueness (excluding self)
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", parsed.data.username)
    .neq("id", user.id)
    .maybeSingle();

  if (existing) return { error: "Ese nombre de usuario ya está en uso" };

  const { error } = await supabase
    .from("users")
    .update({
      display_name: parsed.data.display_name,
      username: parsed.data.username,
      bio: parsed.data.bio ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/profile", "layout");
  return { data: undefined };
}

export async function likeEntry(entryId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("entry_likes")
    .insert({ entry_id: entryId, user_id: user.id });

  if (error) return { error: error.message };
  return { data: undefined };
}

export async function unlikeEntry(entryId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("entry_likes")
    .delete()
    .eq("entry_id", entryId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { data: undefined };
}
