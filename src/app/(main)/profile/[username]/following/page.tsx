import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserProfile, getFollowingList } from "@/lib/supabase/queries";
import { BackButton } from "@/components/ui/back-button";
import { UserCard } from "@/components/social/user-card";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `Siguiendo — @${username} — CUPPING` };
}

export default async function FollowingPage({ params }: Props) {
  const { username } = await params;
  const supabase = await createServerSupabaseClient();
  const profile = await getUserProfile(supabase, username);
  if (!profile) notFound();

  const following = await getFollowingList(supabase, profile.id);

  return (
    <div className="px-4 sm:px-6 py-8 sm:py-10 max-w-2xl mx-auto">
      <BackButton className="mb-4" />
      <h1 className="font-display text-2xl text-espresso mb-1">
        Siguiendo
      </h1>
      <p className="text-xs text-espresso-light mb-6">@{username}</p>

      {following.length === 0 ? (
        <p className="text-espresso-light text-sm text-center py-10">
          Todavía no sigue a nadie.
        </p>
      ) : (
        <div className="space-y-3">
          {following.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
