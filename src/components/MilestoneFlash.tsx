"use client";

import { useEffect } from "react";
import { Milestone } from "@/hooks/useCallTracker";

export default function MilestoneFlash({
  milestone,
  onDismiss,
}: {
  milestone: Milestone;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!milestone) return;
    const t = setTimeout(onDismiss, 2600);
    return () => clearTimeout(t);
  }, [milestone, onDismiss]);

  if (!milestone) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center px-4"
      aria-live="assertive"
    >
      <div className="card animate-flash-in flex items-center gap-3 px-5 py-3">
        <span className="text-lg text-ink" aria-hidden>
          ✦
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold text-ink">{milestone.label}</p>
          <p className="text-xs text-muted">{milestone.message}</p>
        </div>
      </div>
    </div>
  );
}
