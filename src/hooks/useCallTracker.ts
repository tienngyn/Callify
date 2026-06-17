"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STORAGE_KEY, getDayConfig, MILESTONES } from "@/lib/config";
import { dayKey, minutesOfDay } from "@/lib/date";
import { computePace } from "@/lib/pace";

type StoredState = {
  date: string;
  completed: number;
  touched: number;
};

function loadState(today: string): StoredState {
  if (typeof window === "undefined") {
    return { date: today, completed: 0, touched: 0 };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredState;
      // Neuer Kalendertag -> sauber bei 0 starten.
      if (parsed.date === today) {
        return {
          date: today,
          completed: Math.max(0, parsed.completed | 0),
          touched: Math.max(0, parsed.touched | 0),
        };
      }
    }
  } catch {
    /* korrupter State -> frisch starten */
  }
  return { date: today, completed: 0, touched: 0 };
}

export type Milestone = { label: string; message: string } | null;

export function useCallTracker() {
  // Auf dem Server / erstem Render deterministisch (vermeidet Hydration-Mismatch).
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());
  const [completed, setCompleted] = useState(0);
  const [touched, setTouched] = useState(0);

  const [justBumped, setJustBumped] = useState(false);
  const [milestone, setMilestone] = useState<Milestone>(null);
  const prevCompleted = useRef(0);

  const today = dayKey(now);
  const weekday = now.getDay();
  const config = getDayConfig(weekday);

  // Initiales Laden aus localStorage nach Mount.
  useEffect(() => {
    const t = dayKey();
    const s = loadState(t);
    setCompleted(s.completed);
    setTouched(s.touched);
    prevCompleted.current = s.completed;
    setHydrated(true);
  }, []);

  // Persistieren.
  useEffect(() => {
    if (!hydrated) return;
    const state: StoredState = { date: today, completed, touched };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* localStorage nicht verfügbar -> still ignorieren */
    }
  }, [hydrated, today, completed, touched]);

  // Live-Uhr: minütlich aktualisieren (für Pace) + Datumswechsel abfangen.
  useEffect(() => {
    const id = setInterval(() => {
      const next = new Date();
      setNow((prev) => {
        // Bei Tageswechsel Zähler zurücksetzen.
        if (dayKey(prev) !== dayKey(next)) {
          setCompleted(0);
          setTouched(0);
          prevCompleted.current = 0;
        }
        return next;
      });
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // Meilenstein- + Bump-Erkennung bei Erhöhung.
  useEffect(() => {
    if (!hydrated) return;
    const prev = prevCompleted.current;
    if (completed > prev) {
      setJustBumped(true);
      const bumpTimer = setTimeout(() => setJustBumped(false), 420);

      // Wurde eine Meilenstein-Schwelle überschritten?
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

  const addCompleted = useCallback(() => setCompleted((c) => c + 1), []);
  const undoCompleted = useCallback(
    () => setCompleted((c) => Math.max(0, c - 1)),
    []
  );
  const addTouched = useCallback(() => setTouched((t) => t + 1), []);
  const resetDay = useCallback(() => {
    setCompleted(0);
    setTouched(0);
    prevCompleted.current = 0;
    setMilestone(null);
  }, []);

  const dismissMilestone = useCallback(() => setMilestone(null), []);

  const pace = computePace(completed, minutesOfDay(now), config);

  return {
    hydrated,
    now,
    weekday,
    goal: config.goal,
    window: config.window,
    completed,
    touched,
    pace,
    justBumped,
    milestone,
    addCompleted,
    undoCompleted,
    addTouched,
    resetDay,
    dismissMilestone,
  };
}
