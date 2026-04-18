"use client";

import { useState } from "react";
import { RatingCups, FlavorTagGroup } from "@/components/coffee";
import type { FlavorTag } from "@/types/coffee";

export function RatingCupsDemo() {
  const [rating, setRating] = useState(4);
  return (
    <div className="space-y-3">
      <RatingCups value={rating} onChange={setRating} size="lg" />
      <div className="flex gap-4">
        <RatingCups value={3.5} size="md" readOnly />
        <RatingCups value={2} size="sm" readOnly />
      </div>
    </div>
  );
}

export function FlavorTagsDemo() {
  const [selected, setSelected] = useState<FlavorTag[]>(["chocolate", "nutty"]);
  return <FlavorTagGroup selected={selected} onChange={setSelected} />;
}
