"use client";

import { Pace } from "@/lib/pace";
import { statusColors } from "@/lib/status";

function StatusDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

export default function PaceBanner({ pace }: { pace: Pace }) {
  const c = statusColors(pace.status);
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-5 py-4 transition-colors duration-300"
      style={{ backgroundColor: c.soft }}
      role="status"
      aria-live="polite"
    >
      <StatusDot color={c.main} />
      <div className="min-w-0">
        <p
          className="tnum text-base font-semibold leading-tight"
          style={{ color: c.main }}
        >
          {pace.headline}
        </p>
        <p className="text-sm text-muted leading-tight">{pace.detail}</p>
      </div>
    </div>
  );
}
