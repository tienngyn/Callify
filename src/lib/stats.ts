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

export type DaySummaryData = {
  /** Calls gesamt. */
  total: number;
  /** Aktiv-Fenster (erster bis letzter Call bzw. Start/Ende), Minuten des Tages. */
  startMin: number | null;
  endMin: number | null;
  /** Produktivste Stunde (0–23) und Anzahl darin. */
  peakHour: number | null;
  peakCount: number;
  /** Ø Calls pro aktiver Stunde. */
  perHour: number | null;
  /** Stundenverteilung von der ersten bis zur letzten aktiven Stunde. */
  hourly: { hour: number; count: number }[];
};

/**
 * Wertet die Call-Zeitpunkte eines Tages aus: Summe, Aktiv-Fenster,
 * produktivste Stunde, Schnitt pro Stunde und die Stundenverteilung.
 */
export function summarizeDay(
  events: number[],
  startedAt: number | null,
  endedAt: number | null
): DaySummaryData {
  const total = events.length;
  const counts = new Array(24).fill(0);
  for (const m of events) {
    const h = Math.floor(m / 60);
    if (h >= 0 && h < 24) counts[h]++;
  }

  let startMin = startedAt;
  let endMin = endedAt;
  if (events.length) {
    startMin = startMin ?? Math.min(...events);
    endMin = endMin ?? Math.max(...events);
  }

  let peakHour: number | null = null;
  let peakCount = 0;
  for (let h = 0; h < 24; h++) {
    if (counts[h] > peakCount) {
      peakCount = counts[h];
      peakHour = h;
    }
  }

  let firstH = startMin != null ? Math.floor(startMin / 60) : null;
  let lastH = endMin != null ? Math.floor(endMin / 60) : null;
  if (firstH == null || lastH == null) {
    const withData = counts
      .map((c, h) => ({ c, h }))
      .filter((x) => x.c > 0)
      .map((x) => x.h);
    if (withData.length) {
      firstH = Math.min(...withData);
      lastH = Math.max(...withData);
    }
  }

  const hourly: { hour: number; count: number }[] = [];
  if (firstH != null && lastH != null) {
    for (let h = firstH; h <= lastH; h++) hourly.push({ hour: h, count: counts[h] });
  }

  let perHour: number | null = null;
  if (startMin != null && endMin != null && endMin > startMin) {
    perHour = total / ((endMin - startMin) / 60);
  } else if (total > 0) {
    perHour = total;
  }

  return { total, startMin, endMin, peakHour, peakCount, perHour, hourly };
}
