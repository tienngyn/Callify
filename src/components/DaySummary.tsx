"use client";

import { DaySession } from "@/hooks/useCallTracker";
import { formatMinutes } from "@/lib/date";
import { personalBest, summarizeDay, DaysMap } from "@/lib/stats";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-2 flex flex-col items-center justify-center rounded-2xl px-2 py-3">
      <span className="tnum font-[family-name:var(--font-display)] text-xl font-bold text-ink">
        {value}
      </span>
      <span className="mt-0.5 text-center text-[11px] font-medium text-faint">
        {label}
      </span>
    </div>
  );
}

function duration(fromMin: number, toMin: number): string {
  const mins = Math.max(0, toMin - fromMin);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

export default function DaySummary({
  open,
  onClose,
  session,
  goal,
  stretch,
  days,
  now,
}: {
  open: boolean;
  onClose: () => void;
  session: DaySession | null;
  goal: number;
  stretch: number;
  days: DaysMap;
  now: Date;
}) {
  if (!open) return null;

  const data = summarizeDay(
    session?.events ?? [],
    session?.startedAt ?? null,
    session?.endedAt ?? null
  );
  const best = personalBest(days).best;
  const isRecord = data.total > 0 && data.total === best;
  const reached = data.total >= goal;
  const bonus = Math.max(0, data.total - goal);
  const maxHour = data.hourly.reduce((mx, b) => Math.max(mx, b.count), 0);

  const dateLabel = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Arbeitstag-Übersicht"
    >
      <button
        className="absolute inset-0 bg-black/30"
        aria-label="Schließen"
        onClick={onClose}
      />
      <div className="card animate-flash-in relative m-4 w-full max-w-md p-6">
        <p className="text-sm font-medium text-faint">{dateLabel}</p>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
          Arbeitstag beendet
        </h2>

        {/* Große Zahl + Zielstatus */}
        <div className="mt-4 flex items-end gap-2">
          <span className="tnum font-[family-name:var(--font-display)] text-6xl font-bold leading-none text-ink">
            {data.total}
          </span>
          <span className="mb-1 text-sm font-semibold text-muted">Calls</span>
        </div>
        <p className="mt-1 text-sm font-semibold text-ink">
          {reached
            ? bonus > 0
              ? `Ziel ${goal} erreicht ✓ · +${bonus} Bonus`
              : `Ziel ${goal} erreicht ✓`
            : `${goal - data.total} unter Ziel (${goal})`}
          {isRecord && <span className="text-muted"> · 🏆 Bester Tag</span>}
        </p>

        {/* Kennzahlen */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <Stat
            label="Aktiv"
            value={
              data.startMin != null && data.endMin != null
                ? duration(data.startMin, data.endMin)
                : "–"
            }
          />
          <Stat
            label="Ø / Stunde"
            value={data.perHour != null ? data.perHour.toFixed(1) : "–"}
          />
          <Stat
            label="Top-Stunde"
            value={
              data.peakHour != null
                ? `${String(data.peakHour).padStart(2, "0")}–${String(
                    data.peakHour + 1
                  ).padStart(2, "0")}`
                : "–"
            }
          />
        </div>

        {data.startMin != null && data.endMin != null && (
          <p className="mt-2 text-center text-xs text-faint tnum">
            {formatMinutes(data.startMin)} – {formatMinutes(data.endMin)}
            {data.peakHour != null &&
              ` · stärkste Stunde ${data.peakCount} Calls`}
          </p>
        )}

        {/* Stundenverteilung */}
        {data.hourly.length > 0 && maxHour > 0 && (
          <div className="card-2 mt-4 rounded-2xl p-4">
            <p className="mb-3 text-xs font-semibold text-muted">
              Calls pro Stunde
            </p>
            <div className="flex h-24 items-end gap-1">
              {data.hourly.map((b) => {
                const isPeak = b.hour === data.peakHour;
                return (
                  <div
                    key={b.hour}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-md"
                        style={{
                          height: `${maxHour > 0 ? (b.count / maxHour) * 100 : 0}%`,
                          minHeight: b.count > 0 ? 4 : 0,
                          background: "var(--ring-fill)",
                          opacity: b.count === 0 ? 0.12 : isPeak ? 1 : 0.5,
                        }}
                      />
                    </div>
                    <span className="tnum text-[9px] font-medium text-faint">
                      {b.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="cta mt-5 flex w-full items-center justify-center px-6 py-3.5 text-base"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}
