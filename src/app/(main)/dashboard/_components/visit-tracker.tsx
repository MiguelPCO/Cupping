"use client";

import { useEffect } from "react";
import { markDashboardVisited } from "@/lib/hooks/use-activity-feed";

export function VisitTracker() {
  useEffect(() => {
    markDashboardVisited();
  }, []);
  return null;
}
