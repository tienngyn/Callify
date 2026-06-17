"use client";

import { Pace } from "@/lib/pace";
import { paceDepth } from "@/lib/status";

export default function PaceBanner({ pace }: { pace: Pace }) {
  const depth = paceDepth(pace.status);
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 ${
        depth === "inset" ? "card-2" : "card"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="min-w-0">
        <p className="tnum text-base font-bold leading-tight text-ink">
          {pace.headline}
        </p>
        <p className="text-sm text-muted leading-tight">{pace.detail}</p>
      </div>
    </div>
  );
}
