"use client";

import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { FollowButton } from "@/app/(main)/profile/[username]/_components/follow-button";
import type { FollowUser } from "@/lib/supabase/queries";

interface UserCardProps {
  user: FollowUser;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-parchment p-3">
      <Link href={`/profile/${user.username}`} aria-label={`Ver perfil de ${user.display_name}`}>
        <div className="size-10 rounded-full overflow-hidden bg-copper-100 flex items-center justify-center shrink-0">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.display_name}
              width={40}
              height={40}
              className="size-full object-cover"
            />
          ) : (
            <User className="size-5 text-copper-400" />
          )}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/profile/${user.username}`}
          className="font-medium text-sm text-espresso hover:underline block truncate"
        >
          {user.display_name}
        </Link>
        <p className="text-xs text-parchment">@{user.username}</p>
      </div>
      {/* FollowButton internally returns null for own profile via useCurrentUser() */}
      <FollowButton targetId={user.id} targetUsername={user.username} />
    </div>
  );
}
