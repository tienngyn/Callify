import { getDayConfig, isWorkday } from "./config";
import { dayKey } from "./date";

export type DaysMap = Record<string, number>;

export type MonthStats = {
  /** Summe abgeschlossener Calls im laufenden Monat bis heute. */
  total: number;
  /** Ø über Arbeitstage mit Aktivität (null, wenn noch keine). */
  avgPerWorkday: number | null;
  /** Anzahl Arbeitstage mit mindestens einem Call. */
  activeWorkdays: number;
  /** Aufeinanderfolgende Arbeitstage mit erreichtem Ziel. */
  streak: number;
};

/** Aufeinanderfolgende erreichte Arbeitstage, von heute rückwärts. */
function computeStreak(days: DaysMap, now: Date): number {
  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  const todayKey = dayKey(now);

  // Obergrenze gegen Endlosschleifen (~1 Jahr Arbeitstage).
  for (let i = 0; i < 400; i++) {
    const wd = cursor.getDay();
    if (isWorkday(wd)) {
      const key = dayKey(cursor);
      const done = days[key] ?? 0;
      const goal = getDayConfig(wd).goal;
      if (done >= goal) {
        streak++;
      } else if (key !== todayKey) {
        // Heute noch offen -> Serie nicht abbrechen; sonst Ende.
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function monthStats(days: DaysMap, now: Date): MonthStats {
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = now.getDate();

  let total = 0;
  let sum = 0;
  let active = 0;

  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month, d);
    const done = days[dayKey(date)] ?? 0;
    total += done;
    if (isWorkday(date.getDay()) && done > 0) {
      sum += done;
      active++;
    }
  }

  return {
    total,
    avgPerWorkday: active > 0 ? sum / active : null,
    activeWorkdays: active,
    streak: computeStreak(days, now),
  };
}

/**
 * Persönlicher Rekord über den gesamten Verlauf.
 * `excludeKey` blendet z. B. den heutigen Tag aus (für „Rekord zu schlagen").
 */
export function personalBest(
  days: DaysMap,
  excludeKey?: string
): { best: number; key: string | null } {
  let best = 0;
  let key: string | null = null;
  for (const [k, v] of Object.entries(days)) {
    if (k === excludeKey) continue;
    if (v > best) {
      best = v;
      key = k;
    }
  }
  return { best, key };
}
