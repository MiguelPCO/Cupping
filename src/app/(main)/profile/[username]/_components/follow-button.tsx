"use client";

import { useCurrentUser } from "@/lib/hooks";
import { useIsFollowing, useFollowToggle } from "@/lib/hooks/use-follow";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface FollowButtonProps {
  targetId: string;
  targetUsername: string;
}

export function FollowButton({ targetId, targetUsername }: FollowButtonProps) {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.user?.id;

  const { data: isFollowing = false, isLoading: checkLoading } =
    useIsFollowing(targetId, userId);

  const mutation = useFollowToggle(targetId, targetUsername, isFollowing);

  // Don't show button for own profile
  if (userId === targetId) return null;

  const loading = checkLoading || mutation.isPending;

  return (
    <Button
      onClick={() => mutation.mutate()}
      disabled={loading || !userId}
      className={
        isFollowing
          ? "border border-parchment text-espresso bg-card hover:bg-linen"
          : "bg-copper-500 hover:bg-copper-600 text-white"
      }
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="size-4 mr-1.5" />
          Siguiendo
        </>
      ) : (
        <>
          <UserPlus className="size-4 mr-1.5" />
          Seguir
        </>
      )}
    </Button>
  );
}
