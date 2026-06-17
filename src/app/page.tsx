"use client";

import { useState } from "react";
import { useCallTracker } from "@/hooks/useCallTracker";
import { WEEKDAY_NAMES } from "@/lib/config";
import { formatMinutes } from "@/lib/date";
import { statusColors } from "@/lib/status";
import ProgressRing from "@/components/ProgressRing";
import PaceBanner from "@/components/PaceBanner";
import MilestoneFlash from "@/components/MilestoneFlash";

export default function Home() {
  const t = useCallTracker();
  const [confirmReset, setConfirmReset] = useState(false);
  const c = statusColors(t.pace.status);

  // Vor Hydration ein ruhiges Skelett zeigen (kein Mismatch, kein Flackern).
  if (!t.hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-canvas">
        <div className="h-2 w-24 animate-pulse rounded-full bg-hairline" />
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center bg-canvas px-5 pb-10 pt-8">
      <MilestoneFlash milestone={t.milestone} onDismiss={t.dismissMilestone} />

      <div className="flex w-full max-w-md flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-ink">
              Callify
            </h1>
            <p className="text-sm text-muted">
              {WEEKDAY_NAMES[t.weekday]} · Ziel{" "}
              <span className="tnum font-semibold text-ink">{t.goal}</span> Calls
            </p>
          </div>
          <span className="tnum rounded-full border border-hairline bg-surface px-3 py-1.5 text-sm font-medium text-muted">
            {formatMinutes(t.now.getHours() * 60 + t.now.getMinutes())}
          </span>
        </header>

        {/* Hero: Ring + Zahl */}
        <section className="mt-8 flex flex-col items-center">
          <ProgressRing
            completed={t.completed}
            goal={t.goal}
            color={c.main}
            bumped={t.justBumped}
          />
        </section>

        {/* Pace-Banner */}
        <section className="mt-7">
          <PaceBanner pace={t.pace} />
        </section>

        {/* Berührte Calls (sekundär) */}
        <section className="mt-4 flex items-center justify-between rounded-2xl border border-hairline bg-surface px-5 py-4">
          <div>
            <p className="text-sm font-medium text-ink">Berührte Calls</p>
            <p className="text-xs text-faint">Angerufen, nicht erreicht</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="tnum text-2xl font-semibold text-muted">
              {t.touched}
            </span>
            <button
              onClick={t.addTouched}
              className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-canvas text-xl font-semibold text-muted transition active:scale-95 hover:bg-hairline/50"
              aria-label="Berührten Call hinzufügen"
            >
              +
            </button>
          </div>
        </section>

        {/* Aktionen */}
        <section className="mt-auto pt-8">
          <button
            onClick={t.addCompleted}
            style={{ backgroundColor: c.main }}
            className="flex w-full items-center justify-center gap-2 rounded-[1.5rem] px-6 py-6 text-xl font-bold text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.3)] transition-transform duration-150 active:scale-[0.98]"
          >
            <span aria-hidden className="text-2xl leading-none">＋</span>
            Call abgeschlossen
          </button>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={t.undoCompleted}
              disabled={t.completed === 0}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              ↩ Rückgängig
            </button>

            {confirmReset ? (
              <span className="flex items-center gap-2">
                <button
                  onClick={() => {
                    t.resetDay();
                    setConfirmReset(false);
                  }}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-alarm transition hover:bg-alarm-soft"
                >
                  Wirklich?
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface"
                >
                  Abbrechen
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-faint transition hover:bg-surface hover:text-muted"
              >
                Tag zurücksetzen
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
