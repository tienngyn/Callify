"use client";

import { getDayConfig, isWorkday } from "@/lib/config";
import { dayKey, formatMonth, monthGrid } from "@/lib/date";
import { monthStats, DaysMap } from "@/lib/stats";

const WEEKDAY_HEADER = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-2 flex flex-col items-center justify-center rounded-2xl px-2 py-3">
      <span className="tnum font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
        {value}
      </span>
      <span className="mt-0.5 text-center text-[11px] font-medium text-faint">
        {label}
      </span>
    </div>
  );
}

export default function MonthView({ days, now }: { days: DaysMap; now: Date }) {
  const stats = monthStats(days, now);
  const grid = monthGrid(now);
  const todayKey = dayKey(now);

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-sm font-semibold text-muted">{formatMonth(now)}</p>

      <div className="grid grid-cols-3 gap-2.5">
        <Tile label="Calls gesamt" value={String(stats.total)} />
        <Tile
          label="Ø / Arbeitstag"
          value={stats.avgPerWorkday === null ? "–" : stats.avgPerWorkday.toFixed(1)}
        />
        <Tile label="Serie (Tage)" value={String(stats.streak)} />
      </div>

      {/* Heatmap-Kalender */}
      <div className="card mt-1 p-4">
        <div className="mb-2 grid grid-cols-7 gap-1.5">
          {WEEKDAY_HEADER.map((d) => (
            <span
              key={d}
              className="text-center text-[11px] font-semibold text-faint"
            >
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {grid.map(({ date, inMonth }) => {
            const key = dayKey(date);
            const done = days[key] ?? 0;
            const goal = getDayConfig(date.getDay()).goal;
            const ratio = goal > 0 ? Math.min(done / goal, 1) : 0;
            const fill = done > 0 ? 0.2 + 0.8 * ratio : 0;
            const isToday = key === todayKey;
            const work = isWorkday(date.getDay());

            return (
              <div
                key={key}
                className="relative grid aspect-square place-items-center overflow-hidden rounded-lg"
                style={{
                  background: "var(--ring-track)",
                  opacity: inMonth ? 1 : 0.35,
                  boxShadow: isToday
                    ? "0 0 0 2px var(--ring-fill)"
                    : undefined,
                }}
                title={`${key}: ${done}${work ? ` / ${goal}` : ""}`}
              >
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{ background: "var(--ring-fill)", opacity: fill }}
                />
                <span
                  className={`tnum relative text-[11px] font-semibold ${
                    fill > 0.55 ? "text-[var(--color-canvas)]" : "text-muted"
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
