"use client";

import { useState } from "react";
import { useCallTracker } from "@/hooks/useCallTracker";
import { WEEKDAY_NAMES } from "@/lib/config";
import { formatMinutes } from "@/lib/date";
import ProgressRing from "@/components/ProgressRing";
import PaceBanner from "@/components/PaceBanner";
import MilestoneFlash from "@/components/MilestoneFlash";

export default function Home() {
  const t = useCallTracker();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!t.hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-canvas">
        <div className="nm-inset h-3 w-28 rounded-full" />
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
          <span className="nm-inset tnum rounded-full px-4 py-2 text-sm font-semibold text-muted">
            {formatMinutes(t.now.getHours() * 60 + t.now.getMinutes())}
          </span>
        </header>

        {/* Hero: Ring + Zahl */}
        <section className="mt-8 flex flex-col items-center">
          <ProgressRing
            completed={t.completed}
            goal={t.goal}
            bumped={t.justBumped}
          />
        </section>

        {/* Pace-Banner */}
        <section className="mt-9">
          <PaceBanner pace={t.pace} />
        </section>

        {/* Berührte Calls (sekundär) */}
        <section className="nm-inset mt-4 flex items-center justify-between rounded-3xl px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-ink">Berührte Calls</p>
            <p className="text-xs text-faint">Angerufen, nicht erreicht</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="tnum text-2xl font-bold text-muted">
              {t.touched}
            </span>
            <button
              onClick={t.addTouched}
              className="nm-icon grid h-11 w-11 place-items-center rounded-full text-xl font-semibold"
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
            className="nm-cta flex w-full items-center justify-center gap-2 rounded-[2rem] px-6 py-6 text-xl font-bold"
          >
            <span aria-hidden className="text-2xl leading-none">
              ＋
            </span>
            Call abgeschlossen
          </button>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={t.undoCompleted}
              disabled={t.completed === 0}
              className="nm-ghost rounded-xl px-4 py-2.5 text-sm font-semibold text-muted disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="nm-ghost rounded-xl px-3 py-2.5 text-sm font-bold text-ink"
                >
                  Wirklich?
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="nm-ghost rounded-xl px-3 py-2.5 text-sm font-medium text-muted"
                >
                  Abbrechen
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="nm-ghost rounded-xl px-4 py-2.5 text-sm font-medium text-faint"
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
