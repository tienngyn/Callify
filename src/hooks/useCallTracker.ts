"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STORAGE_KEY, getDayConfig, MILESTONES } from "@/lib/config";
import { dayKey, minutesOfDay } from "@/lib/date";
import { computePace } from "@/lib/pace";
import { personalBest } from "@/lib/stats";

/** Verlauf: abgeschlossene Calls pro Kalendertag (Key = YYYY-MM-DD). */
type DaysMap = Record<string, number>;

/** Detaillierte Tages-Session (für Start/Ende & Tagesübersicht). */
export type DaySession = {
  /** Minute des Tages, zu der der Arbeitstag gestartet wurde. */
  startedAt: number | null;
  /** Minute des Tages, zu der der Arbeitstag beendet wurde. */
  endedAt: number | null;
  /** Läuft der Arbeitstag gerade? */
  active: boolean;
  /** Minute des Tages je abgeschlossenem Call (für Stunden-Verteilung). */
  events: number[];
};
type SessionsMap = Record<string, DaySession>;

type StoredState = { version: 3; days: DaysMap; sessions: SessionsMap };

const emptySession = (): DaySession => ({
  startedAt: null,
  endedAt: null,
  active: false,
  events: [],
});

/** Alte Einträge kappen, damit localStorage nicht endlos wächst. */
function prune(days: DaysMap, keepDays = 70): DaysMap {
  const keys = Object.keys(days).sort();
  if (keys.length <= keepDays) return days;
  const drop = new Set(keys.slice(0, keys.length - keepDays));
  const next: DaysMap = {};
  for (const k of keys) if (!drop.has(k)) next[k] = days[k];
  return next;
}

function loadState(): { days: DaysMap; sessions: SessionsMap } {
  if (typeof window === "undefined") return { days: {}, sessions: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { days: {}, sessions: {} };
    const parsed = JSON.parse(raw);
    if (parsed?.version === 3 && parsed.days) {
      return { days: parsed.days, sessions: parsed.sessions ?? {} };
    }
    // v2 -> v3 (nur Tageszahlen, keine Sessions).
    if (parsed?.version === 2 && parsed.days) {
      return { days: parsed.days, sessions: {} };
    }
    // v1 -> v3 (war { date, completed, touched }).
    if (parsed && typeof parsed.completed === "number" && parsed.date) {
      return {
        days: { [parsed.date]: Math.max(0, parsed.completed | 0) },
        sessions: {},
      };
    }
  } catch {
    /* korrupt -> frisch */
  }
  return { days: {}, sessions: {} };
}

export type Milestone = { label: string; message: string } | null;

export function useCallTracker() {
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());
  const [days, setDays] = useState<DaysMap>({});
  const [sessions, setSessions] = useState<SessionsMap>({});

  const [justBumped, setJustBumped] = useState(false);
  const [milestone, setMilestone] = useState<Milestone>(null);
  const prevCompleted = useRef(0);

  const today = dayKey(now);
  const weekday = now.getDay();
  const config = getDayConfig(weekday);
  const completed = days[today] ?? 0;

  // Bisheriger Bestwert ohne heute (der Rekord, den es zu schlagen gilt).
  const recordToBeat = useMemo(
    () => personalBest(days, today).best,
    [days, today]
  );

  // Laden nach Mount.
  useEffect(() => {
    const loaded = loadState();
    setDays(loaded.days);
    setSessions(loaded.sessions);
    prevCompleted.current = loaded.days[dayKey()] ?? 0;
    setHydrated(true);
  }, []);

  // Persistieren.
  useEffect(() => {
    if (!hydrated) return;
    const state: StoredState = { version: 3, days, sessions };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [hydrated, days, sessions]);

  // Live-Uhr (für Pace) + Datumswechsel.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);

    // Punktgenauer Tick kurz nach Mitternacht — robust auch dann, wenn das
    // 30s-Intervall im Hintergrund gedrosselt wird.
    let midnightTimer: ReturnType<typeof setTimeout>;
    const scheduleMidnight = () => {
      const n = new Date();
      const next = new Date(
        n.getFullYear(),
        n.getMonth(),
        n.getDate() + 1,
        0,
        0,
        2
      );
      midnightTimer = setTimeout(() => {
        setNow(new Date());
        scheduleMidnight();
      }, next.getTime() - n.getTime());
    };
    scheduleMidnight();

    // Beim Zurückkehren in den Tab die Uhr sofort nachziehen.
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(new Date());
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      clearTimeout(midnightTimer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Bump- + Meilenstein-Erkennung.
  useEffect(() => {
    if (!hydrated) return;
    const prev = prevCompleted.current;
    if (completed > prev) {
      setJustBumped(true);
      const bumpTimer = setTimeout(() => setJustBumped(false), 420);

      // Stretch-Ziel (z. B. 40) hat Vorrang vor den Ziel-Meilensteinen.
      const hitStretch =
        prev < config.stretchGoal && completed >= config.stretchGoal;
      // Neuer persönlicher Rekord (nur wenn es überhaupt einen zu schlagen gab).
      const brokeRecord =
        recordToBeat > 0 && prev <= recordToBeat && completed > recordToBeat;
      const hit = MILESTONES.find((m) => {
        const threshold = Math.ceil(m.fraction * config.goal);
        return prev < threshold && completed >= threshold;
      });
      if (hitStretch) {
        setMilestone({
          label: "Stretch geknackt 🚀",
          message: `Volle ${config.stretchGoal} — stark!`,
        });
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          try {
            navigator.vibrate([40, 60, 40, 60, 120]);
          } catch {
            /* ignore */
          }
        }
      } else if (brokeRecord) {
        setMilestone({
          label: "Neuer Rekord 🏆",
          message: `${completed} Calls — dein bester Tag.`,
        });
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          try {
            navigator.vibrate([60, 50, 60]);
          } catch {
            /* ignore */
          }
        }
      } else if (hit) {
        setMilestone({ label: hit.label, message: hit.message });
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          try {
            navigator.vibrate(hit.fraction >= 1 ? [40, 60, 120] : 30);
          } catch {
            /* ignore */
          }
        }
      }
      prevCompleted.current = completed;
      return () => clearTimeout(bumpTimer);
    }
    prevCompleted.current = completed;
  }, [completed, hydrated, config.goal, config.stretchGoal, recordToBeat]);

  const addCompleted = useCallback(() => {
    const t = dayKey();
    const m = minutesOfDay();
    setDays((prev) => prune({ ...prev, [t]: (prev[t] ?? 0) + 1 }));
    setSessions((prev) => {
      const s = prev[t] ?? emptySession();
      return {
        ...prev,
        [t]: {
          ...s,
          events: [...s.events, m],
          startedAt: s.startedAt ?? m,
          active: true,
          endedAt: null,
        },
      };
    });
  }, []);

  const undoCompleted = useCallback(() => {
    const t = dayKey();
    setDays((prev) => ({ ...prev, [t]: Math.max(0, (prev[t] ?? 0) - 1) }));
    setSessions((prev) => {
      const s = prev[t];
      if (!s || s.events.length === 0) return prev;
      return { ...prev, [t]: { ...s, events: s.events.slice(0, -1) } };
    });
  }, []);

  const resetDay = useCallback(() => {
    const t = dayKey();
    setDays((prev) => ({ ...prev, [t]: 0 }));
    setSessions((prev) => ({ ...prev, [t]: emptySession() }));
    prevCompleted.current = 0;
    setMilestone(null);
  }, []);

  const startWorkday = useCallback(() => {
    const t = dayKey();
    const m = minutesOfDay();
    setSessions((prev) => {
      const s = prev[t] ?? emptySession();
      return {
        ...prev,
        [t]: { ...s, startedAt: s.startedAt ?? m, active: true, endedAt: null },
      };
    });
  }, []);

  const endWorkday = useCallback(() => {
    const t = dayKey();
    const m = minutesOfDay();
    setSessions((prev) => {
      const s = prev[t] ?? emptySession();
      return { ...prev, [t]: { ...s, active: false, endedAt: m } };
    });
  }, []);

  const dismissMilestone = useCallback(() => setMilestone(null), []);

  const pace = computePace(completed, minutesOfDay(now), config);

  const session = sessions[today] ?? null;
  const workdayActive = session?.active ?? false;
  const workdayStarted =
    session != null &&
    (session.startedAt != null || session.active || session.events.length > 0);
  const workdayEnded =
    session != null && session.endedAt != null && !session.active;

  return {
    hydrated,
    now,
    weekday,
    goal: config.goal,
    stretchGoal: config.stretchGoal,
    completed,
    days,
    session,
    workdayActive,
    workdayStarted,
    workdayEnded,
    pace,
    justBumped,
    milestone,
    addCompleted,
    undoCompleted,
    resetDay,
    startWorkday,
    endWorkday,
    dismissMilestone,
  };
}
