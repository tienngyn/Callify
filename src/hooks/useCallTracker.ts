"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STORAGE_KEY, getDayConfig, MILESTONES } from "@/lib/config";
import { dayKey, minutesOfDay } from "@/lib/date";
import { computePace } from "@/lib/pace";

/** Verlauf: abgeschlossene Calls pro Kalendertag (Key = YYYY-MM-DD). */
type DaysMap = Record<string, number>;
type StoredState = { version: 2; days: DaysMap };

/** Alte Einträge kappen, damit localStorage nicht endlos wächst. */
function prune(days: DaysMap, keepDays = 70): DaysMap {
  const keys = Object.keys(days).sort();
  if (keys.length <= keepDays) return days;
  const drop = new Set(keys.slice(0, keys.length - keepDays));
  const next: DaysMap = {};
  for (const k of keys) if (!drop.has(k)) next[k] = days[k];
  return next;
}

function loadDays(): DaysMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // v1 -> v2 Migration (war { date, completed, touched }).
    if (parsed && parsed.version === 2 && parsed.days) {
      return parsed.days as DaysMap;
    }
    if (parsed && typeof parsed.completed === "number" && parsed.date) {
      return { [parsed.date]: Math.max(0, parsed.completed | 0) };
    }
  } catch {
    /* korrupt -> frisch */
  }
  return {};
}

export type Milestone = { label: string; message: string } | null;

export function useCallTracker() {
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());
  const [days, setDays] = useState<DaysMap>({});

  const [justBumped, setJustBumped] = useState(false);
  const [milestone, setMilestone] = useState<Milestone>(null);
  const prevCompleted = useRef(0);

  const today = dayKey(now);
  const weekday = now.getDay();
  const config = getDayConfig(weekday);
  const completed = days[today] ?? 0;

  // Laden nach Mount.
  useEffect(() => {
    const loaded = loadDays();
    setDays(loaded);
    prevCompleted.current = loaded[dayKey()] ?? 0;
    setHydrated(true);
  }, []);

  // Persistieren.
  useEffect(() => {
    if (!hydrated) return;
    const state: StoredState = { version: 2, days };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [hydrated, days]);

  // Live-Uhr (für Pace) + Datumswechsel.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Bump- + Meilenstein-Erkennung.
  useEffect(() => {
    if (!hydrated) return;
    const prev = prevCompleted.current;
    if (completed > prev) {
      setJustBumped(true);
      const bumpTimer = setTimeout(() => setJustBumped(false), 420);

      const hit = MILESTONES.find((m) => {
        const threshold = Math.ceil(m.fraction * config.goal);
        return prev < threshold && completed >= threshold;
      });
      if (hit) {
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
  }, [completed, hydrated, config.goal]);

  const setToday = useCallback((updater: (current: number) => number) => {
    setDays((prev) => {
      const t = dayKey();
      const next = Math.max(0, updater(prev[t] ?? 0));
      return prune({ ...prev, [t]: next });
    });
  }, []);

  const addCompleted = useCallback(() => setToday((c) => c + 1), [setToday]);
  const undoCompleted = useCallback(() => setToday((c) => c - 1), [setToday]);
  const resetDay = useCallback(() => {
    setToday(() => 0);
    prevCompleted.current = 0;
    setMilestone(null);
  }, [setToday]);

  const dismissMilestone = useCallback(() => setMilestone(null), []);

  const pace = computePace(completed, minutesOfDay(now), config);

  return {
    hydrated,
    now,
    weekday,
    goal: config.goal,
    completed,
    days,
    pace,
    justBumped,
    milestone,
    addCompleted,
    undoCompleted,
    resetDay,
    dismissMilestone,
  };
}
