"use client";

import { getDayConfig, isWorkday, WEEKDAY_SHORT } from "@/lib/config";
import { dayKey, weekDates } from "@/lib/date";

type Props = {
  days: Record<string, number>;
  now: Date;
};

export default function WeekView({ days, now }: Props) {
  const week = weekDates(now);
  const todayKey = dayKey(now);

  let doneSum = 0;
  let targetSum = 0;

  const rows = week.map((d) => {
    const key = dayKey(d);
    const weekday = d.getDay();
    const work = isWorkday(weekday);
    const goal = getDayConfig(weekday).goal;
    const done = days[key] ?? 0;
    const isToday = key === todayKey;
    const isFuture = d.getTime() > now.getTime() && !isToday;

    doneSum += done;
    if (work) targetSum += goal;

    return { key, weekday, work, goal, done, isToday, isFuture };
  });

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Wochensumme */}
      <div className="card flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-muted">Diese Woche</p>
          <p className="text-xs text-faint">Abgeschlossene Calls</p>
        </div>
        <p className="tnum font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          {doneSum}
          <span className="text-base font-semibold text-faint"> / {targetSum}</span>
        </p>
      </div>

      {/* Tagesliste */}
      <ul className="flex flex-col gap-1.5">
        {rows.map((r) => {
          const ratio = r.goal > 0 ? Math.min(r.done / r.goal, 1) : 0;
          const reached = r.work && r.done >= r.goal;
          return (
            <li
              key={r.key}
              className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 ${
                r.isToday ? "card-2" : ""
              }`}
            >
              <span
                className={`tnum w-7 shrink-0 text-sm font-bold ${
                  r.work ? "text-ink" : "text-faint"
                }`}
              >
                {WEEKDAY_SHORT[r.weekday]}
              </span>

              {/* Balken */}
              <div className="ring-track-bar h-2.5 flex-1 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${ratio * 100}%`,
                    background: "var(--ring-fill)",
                    transition: "width 0.5s cubic-bezier(0.2,0.8,0.2,1)",
                  }}
                />
              </div>

              <span className="tnum w-16 shrink-0 text-right text-sm font-semibold text-muted">
                {r.isFuture ? (
                  <span className="text-faint">–</span>
                ) : r.work ? (
                  <>
                    <span className={reached ? "text-ink" : ""}>{r.done}</span>
                    <span className="text-faint">/{r.goal}</span>
                  </>
                ) : (
                  <span className={r.done ? "text-ink" : "text-faint"}>
                    {r.done}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
