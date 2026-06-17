"use client";

import { Pace } from "@/lib/pace";
import { statusMeta } from "@/lib/status";

export default function PaceBanner({ pace }: { pace: Pace }) {
  const meta = statusMeta(pace.status);
  return (
    <div
      className={`flex items-center gap-4 rounded-3xl px-5 py-4 ${
        meta.depth === "inset" ? "nm-inset" : "nm-raised"
      }`}
      role="status"
      aria-live="polite"
    >
      <span
        className="nm-inset tnum grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-bold text-ink"
        aria-hidden
      >
        {meta.symbol}
      </span>
      <div className="min-w-0">
        <p className="tnum text-base font-bold leading-tight text-ink">
          {pace.headline}
        </p>
        <p className="text-sm text-muted leading-tight">{pace.detail}</p>
      </div>
    </div>
  );
}
