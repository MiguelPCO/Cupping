import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { User } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserProfile, getEntriesForUser, getCollectionItems } from "@/lib/supabase/queries";
import { FollowButton } from "./_components/follow-button";
import { ProfileEditForm } from "./_components/profile-edit-form";
import { ProfileTabs } from "./_components/profile-tabs";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} — CUPPING`,
    description: `Perfil de ${username} en CUPPING`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch profile
  const profile = await getUserProfile(supabase, username);
  if (!profile) notFound();

  // Current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const isOwnProfile = currentUser?.id === profile.id;

  // Fetch entries + follow counts + favorites collection in parallel
  const [entries, followersResult, followingResult, favoritesCollection] = await Promise.all([
    getEntriesForUser(supabase, profile.id),
    supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase
      .from("follows")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", profile.id),
    supabase
      .from("collections")
      .select("id")
      .eq("user_id", profile.id)
      .eq("type", "favorites")
      .maybeSingle(),
  ]);

  const followersCount = followersResult.count ?? 0;
  const followingCount = followingResult.count ?? 0;

  const favoriteItems = favoritesCollection.data
    ? await getCollectionItems(supabase, favoritesCollection.data.id)
    : [];

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="size-20 rounded-full overflow-hidden bg-copper-100 flex items-center justify-center shrink-0">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name}
              width={80}
              height={80}
              className="size-full object-cover"
            />
          ) : (
            <User className="size-9 text-copper-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl text-espresso leading-tight">
            {profile.display_name}
          </h1>
          <p className="text-espresso-light text-sm">@{profile.username}</p>
          {profile.bio && (
            <p className="text-espresso-light text-sm mt-1 line-clamp-3">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-6 mb-4">
        <div className="text-center">
          <p className="font-mono text-xl font-medium text-espresso">
            {entries.length}
          </p>
          <p className="text-xs text-espresso-light">Reseñas</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-xl font-medium text-espresso">
            {followersCount}
          </p>
          <p className="text-xs text-espresso-light">Seguidores</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-xl font-medium text-espresso">
            {followingCount}
          </p>
          <p className="text-xs text-espresso-light">Siguiendo</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-8">
        {isOwnProfile ? (
          <ProfileEditForm
            displayName={profile.display_name}
            username={profile.username}
            bio={profile.bio}
          />
        ) : (
          <FollowButton targetId={profile.id} targetUsername={profile.username} />
        )}
      </div>

      {/* Reviews + Favorites */}
      <ProfileTabs
        entries={entries}
        favoriteItems={favoriteItems}
        currentUserId={currentUser?.id}
        isOwnProfile={isOwnProfile}
        profileDisplayName={profile.display_name}
      />
    </div>
  );
}
